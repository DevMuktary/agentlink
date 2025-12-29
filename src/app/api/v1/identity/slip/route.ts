import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByNumber } from '@/services/providers/robost-nin';
import { generateNinSlipPdf } from '@/services/pdf-generator';

export async function POST(req: Request) {
  try {
    // 1. Authenticate User
    const auth = await validateApiKey(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { nin, service_code, reference } = body;

    // Validate Input
    if (!nin || !service_code) {
      return NextResponse.json({ error: 'NIN and service_code are required' }, { status: 400 });
    }

    // 2. CHECK SERVICE & ADMIN CONTROL
    const service = await prisma.service.findUnique({
      where: { serviceCode: Number(service_code) },
    });

    if (!service) {
      return NextResponse.json({ error: 'Invalid Service Code' }, { status: 400 });
    }

    if (!service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable' }, { status: 503 });
    }

    // 3. CHECK WALLET & BALANCE
    const user = await prisma.user.findUnique({ where: { id: auth.id } });
    const COST = Number(service.price);

    if (Number(user?.walletBalance) < COST) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 402 });
    }

    // 4. DEDUCT MONEY (Single Transaction)
    const requestLog = await prisma.$transaction(async (tx) => {
      // Deduct balance
      await tx.user.update({
        where: { id: user!.id },
        data: { walletBalance: { decrement: COST } }
      });

      // Log request
      return await tx.serviceRequest.create({
        data: {
          userId: user!.id,
          serviceType: service.code, 
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
        await prisma.$transaction([
            prisma.user.update({ where: { id: user!.id }, data: { walletBalance: { increment: COST } } }),
            prisma.serviceRequest.update({ 
                where: { id: requestLog.id }, 
                data: { status: 'FAILED', responseData: { error: providerResponse.error } } 
            })
        ]);
        return NextResponse.json({ status: false, error: providerResponse.error }, { status: 400 });
    }

    // 6. MAP CODE TO TEMPLATE
    let templateType = 'regular';
    if (Number(service_code) === 401) templateType = 'premium';
    else if (Number(service_code) === 402) templateType = 'standard';
    else if (Number(service_code) === 403) templateType = 'regular';

    // 7. GENERATE PDF
    try {
        const pdfBuffer = await generateNinSlipPdf(templateType, providerResponse.data);
        const pdfBase64 = pdfBuffer.toString('base64');

        // SUCCESS: Save Log
        await prisma.serviceRequest.update({
            where: { id: requestLog.id },
            data: { 
                status: 'COMPLETED', 
                // We store the data internally for history, but we WON'T send it to user
                responseData: { ...providerResponse.data, pdf_base64: pdfBase64 } 
            }
        });

        // RESPONSE: Only send the PDF and Status
        return NextResponse.json({
            status: true,
            message: 'Slip Generated Successfully',
            // data: providerResponse.data, <--- REMOVED THIS LINE
            pdf_base64: pdfBase64
        });

    } catch (pdfError) {
        console.error("PDF Error:", pdfError);
        // ERROR: Refund if PDF fails
        await prisma.$transaction([
            prisma.user.update({ where: { id: user!.id }, data: { walletBalance: { increment: COST } } }),
            prisma.serviceRequest.update({ 
                where: { id: requestLog.id }, 
                data: { status: 'FAILED', responseData: { error: 'Document Generation Failed' } } 
            })
        ]);
        return NextResponse.json({ status: false, error: 'System Error: Could not generate document' }, { status: 500 });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ status: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
