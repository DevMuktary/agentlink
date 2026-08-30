import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByNumber } from '@/services/providers/robost-nin';
import { generateNinSlipPdf } from '@/services/pdf-generator';
import { distributeReferralCommission } from '@/services/referral.service';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Authenticate User
    const auth = await validateApiKey(req);
    if (!auth) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ status: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { nin, service_code } = body;

    // Generate Reference if missing
    const reference = body.reference || `SLIP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Validate Input
    if (!nin || !service_code) {
      return NextResponse.json({ status: false, error: 'NIN and service_code are required' }, { status: 400 });
    }
    
    // 2. CHECK SERVICE & ADMIN CONTROL
    const service = await prisma.service.findFirst({
      where: { serviceCode: Number(service_code) },
    });

    if (!service) {
      return NextResponse.json({ status: false, error: `Invalid Service Code: ${service_code}` }, { status: 400 });
    }

    if (!service.isActive) {
      return NextResponse.json({ status: false, error: 'This service is currently unavailable' }, { status: 503 });
    }

    // 3. CHECK WALLET & BALANCE
    const user = await prisma.user.findUnique({ where: { id: auth.id } });
    const COST = Number(service.price);

    if (Number(user?.walletBalance) < COST) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 4. DEDUCT MONEY (Single Transaction)
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct balance
      await tx.user.update({
        where: { id: user!.id },
        data: { walletBalance: { decrement: COST } }
      });

      // B. Log Transaction (Processing)
      await tx.transaction.create({
        data: {
          userId: user!.id,
          amount: COST,
          type: 'SERVICE_CHARGE',
          status: 'PROCESSING', 
          reference: reference, 
          description: `NIN Slip (${service.name}) - ${nin}`,
          serviceId: service.code 
        }
      });

      // C. Log request
      return await tx.serviceRequest.create({
        data: {
          userId: user!.id,
          serviceType: service.code as any, 
          status: 'PROCESSING',
          cost: COST,
          requestData: { nin, service_code, clientReference: reference }, 
        }
      });
    });

    // 5. FETCH DATA (Internal Provider Call)
    const providerResponse = await lookupNinByNumber(nin);

    if (!providerResponse.success) {
        // FAIL: Lookup failed entirely (no data retrieved). Refund user.
        await prisma.$transaction(async (tx) => {
            await tx.user.update({ 
                where: { id: user!.id }, 
                data: { walletBalance: { increment: COST } } 
            });

            await tx.transaction.create({
                data: {
                  userId: user!.id,
                  amount: COST,
                  type: 'REFUND',
                  status: 'COMPLETED',
                  reference: `${reference}-REFUND`,
                  description: `Refund: NIN Slip Provider Failed (${nin})`,
                  serviceId: service.code
                }
            });

            await tx.serviceRequest.update({ 
                where: { id: requestLog.id }, 
                data: { status: 'FAILED', responseData: { error: providerResponse.error } } 
            });
            
            await tx.transaction.deleteMany({
               where: { reference: reference, type: 'SERVICE_CHARGE' }
            });
        });

        return NextResponse.json({ status: false, error: providerResponse.error }, { status: 400 });
    }

    // 6. MAP CODE TO TEMPLATE
    let templateType = 'regular';
    if (Number(service_code) === 401) templateType = 'premium';
    else if (Number(service_code) === 402) templateType = 'standard';
    else if (Number(service_code) === 403) templateType = 'improved'; 

    // 7. GENERATE PDF
    try {
        const pdfBuffer = await generateNinSlipPdf(templateType, providerResponse.data);
        const pdfBase64 = pdfBuffer.toString('base64');

        // SUCCESS: Finalize Logs
        await prisma.$transaction(async (tx) => {
           await tx.serviceRequest.update({
               where: { id: requestLog.id },
               data: { 
                   status: 'COMPLETED', 
                   responseData: { ...providerResponse.data, pdf_generated: true } 
               }
           });
           await tx.transaction.updateMany({
               where: { reference: reference, type: 'SERVICE_CHARGE' },
               data: { status: 'COMPLETED' }
           });
        });

        // Distribute Referral Commission (Dashboard only, strictly skips API)
        try {
          const headersList = await headers();
          const origin = headersList.get('x-request-origin');
          distributeReferralCommission({
            refereeId: auth.id,
            serviceType: service.code,
            serviceRequestId: requestLog.id,
            reference: reference,
            origin: origin,
          }).catch((err) => console.error('Slip Referral Commission Error:', err));
        } catch (err) {
          // Safe fail
        }

        // RESPONSE: Return PDF Base64
        return NextResponse.json({
            status: true,
            message: 'Slip Generated Successfully',
            pdf_base64: pdfBase64
        });

    } catch (pdfError: any) {
        console.error("PDF Error:", pdfError);
        
        // INTERCEPT PHOTO ERRORS
        let errorMessage = 'System Error: Could not generate document. Please contact support.';
        const errStr = String(pdfError?.message || '');
        if (errStr.includes('User Photo') || errStr.includes('SOI not found') || errStr.includes('JPEG')) {
            errorMessage = 'NIMC database returned a corrupt photo. Data was retrieved but slip cannot be generated. Please contact support.';
        }

        // ERROR: PDF failed but data was retrieved. STRICT NO REFUND.
        await prisma.$transaction(async (tx) => {
            // Finalize the charge since data verification cost money
            await tx.transaction.updateMany({
                where: { reference: reference, type: 'SERVICE_CHARGE' },
                data: { status: 'COMPLETED' }
            });

            // Mark request as failed with admin note
            await tx.serviceRequest.update({ 
                where: { id: requestLog.id }, 
                data: { 
                  status: 'FAILED', 
                  adminNote: 'Corrupt photo. Contact Support.',
                  // We still save the retrieved raw data in case support needs to manually build it later
                  responseData: { ...providerResponse.data, error: errorMessage, pdf_generated: false } 
                } 
            });
        });

        return NextResponse.json({ status: false, error: errorMessage }, { status: 400 });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ status: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
