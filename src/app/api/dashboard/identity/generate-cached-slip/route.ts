import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { generateNinSlipPdf } from '@/services/pdf-generator';

export async function POST(req: Request) {
  try {
    // 1. Authenticate User
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { original_reference, service_code, reference } = body;

    if (!original_reference || !service_code || !reference) {
      return NextResponse.json({ status: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    if (!reference.startsWith('DASH-')) {
      return NextResponse.json({ status: false, error: 'Invalid reference prefix' }, { status: 400 });
    }

    // 2. Fetch the Original Verification Data
    // We look up the service request where the clientReference matches the one from step 1
    // The raw JSON data must be in responseData
    const originalRequest = await prisma.serviceRequest.findFirst({
      where: { 
        userId: user.id,
        requestData: { path: ['clientReference'], equals: original_reference },
        status: 'COMPLETED' 
      }
    });

    if (!originalRequest || !originalRequest.responseData) {
      return NextResponse.json({ status: false, error: 'Original verification data not found or invalid.' }, { status: 404 });
    }

    const rawData = originalRequest.responseData as any;
    const nin = rawData.nin || 'UNKNOWN';

    // 3. Fetch Slip Pricing & Status
    const service = await prisma.service.findFirst({
      where: { serviceCode: Number(service_code) },
    });

    if (!service) return NextResponse.json({ status: false, error: `Invalid Service Code: ${service_code}` }, { status: 400 });
    if (!service.isActive) return NextResponse.json({ status: false, error: 'This slip format is currently unavailable' }, { status: 503 });

    const COST = Number(service.price);

    // 4. Check Balance
    if (Number(user.walletBalance) < COST) {
      return NextResponse.json({ status: false, error: 'Insufficient funds for slip generation' }, { status: 402 });
    }

    // 5. Deduct Money & Create New Service Request for History
    const slipRequestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: COST } }
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: COST,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED', 
          reference: reference, 
          description: `NIN Slip Gen (${service.name}) - ${nin}`,
          serviceId: service.code 
        }
      });

      // Create a new request so it appears in the NIN Slip History perfectly
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: service.code as any, 
          status: 'PROCESSING',
          cost: COST,
          requestData: { 
            nin: nin, 
            service_code: service_code, 
            clientReference: reference,
            derivedFrom: original_reference // Track lineage
          }, 
        }
      });
    });

    // 6. Map Code to Template
    let templateType = 'regular';
    if (Number(service_code) === 401 || Number(service_code) === 411 || Number(service_code) === 414) templateType = 'premium';
    else if (Number(service_code) === 402 || Number(service_code) === 412 || Number(service_code) === 415) templateType = 'standard';

    // 7. Generate PDF from CACHED Data (Free, no provider call)
    try {
      const pdfBuffer = await generateNinSlipPdf(templateType, rawData);
      const pdfBase64 = pdfBuffer.toString('base64');

      // 8. Finalize as Completed
      await prisma.serviceRequest.update({
        where: { id: slipRequestLog.id },
        data: { 
          status: 'COMPLETED', 
          responseData: { ...rawData, pdf_generated: true } 
        }
      });

      return NextResponse.json({
        status: true,
        message: 'Slip Generated Successfully',
        pdf_base64: pdfBase64
      });

    } catch (pdfError: any) {
      console.error("PDF Cache Error:", pdfError);
      
      // If PDF fails (e.g., corrupt photo data in the cache), refund the *slip* charge
      await prisma.$transaction(async (tx) => {
          await tx.user.update({ 
              where: { id: user.id }, 
              data: { walletBalance: { increment: COST } } 
          });

          await tx.transaction.create({
              data: {
                userId: user.id,
                amount: COST,
                type: 'REFUND',
                status: 'COMPLETED',
                reference: `${reference}-REFUND`,
                description: `Refund: Corrupted photo data for slip (${nin})`,
                serviceId: service.code
              }
          });

          await tx.serviceRequest.update({ 
              where: { id: slipRequestLog.id }, 
              data: { status: 'FAILED', responseData: { error: 'Photo data corrupted. Slip cannot be generated.' } } 
          });
      });

      return NextResponse.json({ status: false, error: 'Corrupt photo data in record. Slip cannot be generated. Fee refunded.' }, { status: 400 });
    }

  } catch (error) {
    console.error("Cached Slip Route Error:", error);
    return NextResponse.json({ status: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
