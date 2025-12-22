import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByNumber } from '@/services/providers/robost-nin';
import { lookupNinByPhone } from '@/services/providers/robost-phone';
import { generateNinSlipPdf } from '@/services/pdf-generator';
import { ServiceType } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: { type: string; method: string } }
) {
  try {
    // 1. Parse Params
    const { type, method } = await params;
    const { value, reference } = await req.json();

    if (!['premium', 'standard', 'regular'].includes(type)) {
      return NextResponse.json({ status: false, error: 'Invalid slip type' }, { status: 400 });
    }
    if (!['nin', 'phone'].includes(method)) {
      return NextResponse.json({ status: false, error: 'Invalid method. Use "nin" or "phone"' }, { status: 400 });
    }

    // 2. Auth
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 3. Map URL Param to Database Enum
    let dbServiceCode: ServiceType;
    if (type === 'premium') dbServiceCode = ServiceType.NIN_SLIP_PREMIUM;
    else if (type === 'standard') dbServiceCode = ServiceType.NIN_SLIP_STANDARD;
    else dbServiceCode = ServiceType.NIN_SLIP_REGULAR;

    // 4. Fetch Dynamic Price
    const service = await prisma.service.findUnique({ where: { code: dbServiceCode } });
    if (!service || !service.isActive) {
        return NextResponse.json({ status: false, error: `${type} Slip service unavailable` }, { status: 503 });
    }
    const COST = Number(service.price);

    // 5. Check Balance
    if (Number(user.walletBalance) < COST) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 6. Deduct Balance
    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { walletBalance: { decrement: COST } } });
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: dbServiceCode, 
          status: 'PROCESSING',
          cost: COST,
          requestData: { type, method, value, clientReference: reference }, 
        }
      });
    });

    // 7. Fetch Data from Provider (RobostTech)
    let dataResult;
    if (method === 'nin') {
      dataResult = await lookupNinByNumber(value);
    } else {
      dataResult = await lookupNinByPhone(value);
    }

    if (!dataResult.success) {
        // Refund
        await prisma.$transaction([
            prisma.user.update({ where: { id: user.id }, data: { walletBalance: { increment: COST } } }),
            prisma.serviceRequest.update({ where: { id: requestLog.id }, data: { status: 'FAILED', responseData: { error: dataResult.error } } })
        ]);
        return NextResponse.json({ status: false, error: dataResult.error }, { status: 400 });
    }

    // 8. Generate PDF
    try {
        const pdfBuffer = await generateNinSlipPdf(type, dataResult.data);
        const pdfBase64 = pdfBuffer.toString('base64');
        
        // Success
        await prisma.serviceRequest.update({
            where: { id: requestLog.id },
            data: { 
                status: 'COMPLETED', 
                responseData: { ...dataResult.data, pdf_base64: pdfBase64 } 
            }
        });

        return NextResponse.json({
            status: true,
            message: `${type.toUpperCase()} Slip Generated Successfully`,
            pdf_base64: pdfBase64,
            data: dataResult.data
        });

    } catch (pdfError: any) {
        console.error("PDF Gen Failed", pdfError);
        // Refund if PDF fails (Internal Error)
        await prisma.$transaction([
            prisma.user.update({ where: { id: user.id }, data: { walletBalance: { increment: COST } } }),
            prisma.serviceRequest.update({ where: { id: requestLog.id }, data: { status: 'FAILED', responseData: { error: 'PDF Generation Failed' } } })
        ]);
        return NextResponse.json({ status: false, error: 'Failed to generate PDF document' }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
