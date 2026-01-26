import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Fixed import (removed brackets if default export)
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByNumber } from '@/services/providers/robost-nin';
import { generateNinSlipPdf } from '@/services/pdf-generator';

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

    // FIX 1: Generate Reference if missing
    const reference = body.reference || `SLIP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Validate Input
    if (!nin || !service_code) {
      return NextResponse.json({ status: false, error: 'NIN and service_code are required' }, { status: 400 });
    }
    
    // 2. CHECK SERVICE & ADMIN CONTROL
    // We search by the integer code (e.g., 401, 402)
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

      // B. Log Transaction
      await tx.transaction.create({
        data: {
          userId: user!.id,
          amount: COST,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference, 
          description: `NIN Slip (${service.name}) - ${nin}`,
          serviceId: service.code // e.g. "NIN_SLIP_PREMIUM"
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
        // FAIL: Refund user
        await prisma.$transaction(async (tx) => {
            // A. Refund Wallet
            await tx.user.update({ 
                where: { id: user!.id }, 
                data: { walletBalance: { increment: COST } } 
            });

            // B. Log Refund Transaction
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

            // C. Update Request
            await tx.serviceRequest.update({ 
                where: { id: requestLog.id }, 
                data: { status: 'FAILED', responseData: { error: providerResponse.error } } 
            });
        });

        return NextResponse.json({ status: false, error: providerResponse.error }, { status: 400 });
    }

    // 6. MAP CODE TO TEMPLATE
    let templateType = 'regular';
    if (Number(service_code) === 401) templateType = 'premium';
    else if (Number(service_code) === 402) templateType = 'standard';
    else if (Number(service_code) === 403) templateType = 'improved'; // Changed 'regular' to 'improved' based on standard naming

    // 7. GENERATE PDF
    try {
        const pdfBuffer = await generateNinSlipPdf(templateType, providerResponse.data);
        const pdfBase64 = pdfBuffer.toString('base64');

        // SUCCESS: Save Log
        await prisma.serviceRequest.update({
            where: { id: requestLog.id },
            data: { 
                status: 'COMPLETED', 
                // Store raw data internally, but don't expose it all in response if strictly PDF service
                responseData: { ...providerResponse.data, pdf_generated: true } 
            }
        });

        // RESPONSE: Return PDF Base64
        return NextResponse.json({
            status: true,
            message: 'Slip Generated Successfully',
            pdf_base64: pdfBase64
        });

    } catch (pdfError) {
        console.error("PDF Error:", pdfError);
        // ERROR: Refund if PDF fails
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
                  reference: `${reference}-REFUND-PDF`,
                  description: `Refund: PDF Generation Failed (${nin})`,
                  serviceId: service.code
                }
            });

            await tx.serviceRequest.update({ 
                where: { id: requestLog.id }, 
                data: { status: 'FAILED', responseData: { error: 'Document Generation Failed' } } 
            });
        });

        return NextResponse.json({ status: false, error: 'System Error: Could not generate document' }, { status: 500 });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ status: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
