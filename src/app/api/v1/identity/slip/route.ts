import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByNumber } from '@/services/providers/robost-nin';
import { generateNinSlipPdf } from '@/services/pdf-generator';

export async function POST(req: Request) {
  try {
    const auth = await validateApiKey(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { nin, service_code, reference } = body;

    if (!nin || !service_code) {
      return NextResponse.json({ error: 'NIN and service_code are required' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { serviceCode: Number(service_code) },
    });

    if (!service) return NextResponse.json({ error: 'Invalid Service Code' }, { status: 400 });
    if (!service.isActive) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

    const user = await prisma.user.findUnique({ where: { id: auth.id } }); // Fixed: auth returns user object directly
    const COST = Number(service.price);

    if (Number(user?.walletBalance) < COST) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 402 });
    }

    // Deduct & Log
    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user!.id },
        data: { walletBalance: { decrement: COST } }
      });

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

    // Fetch Data
    const providerResponse = await lookupNinByNumber(nin);

    if (!providerResponse.success) {
        await prisma.$transaction([
            prisma.user.update({ where: { id: user!.id }, data: { walletBalance: { increment: COST } } }),
            prisma.serviceRequest.update({ 
                where: { id: requestLog.id }, 
                data: { status: 'FAILED', responseData: { error: providerResponse.error } } 
            })
        ]);
        return NextResponse.json({ status: false, error: providerResponse.error }, { status: 400 });
    }

    // Generate PDF
    let templateType = 'regular';
    if (Number(service_code) === 401) templateType = 'premium';
    else if (Number(service_code) === 402) templateType = 'standard';

    try {
        const pdfBuffer = await generateNinSlipPdf(templateType, providerResponse.data);
        const pdfBase64 = pdfBuffer.toString('base64');

        await prisma.serviceRequest.update({
            where: { id: requestLog.id },
            data: { 
                status: 'COMPLETED', 
                responseData: { ...providerResponse.data, pdf_base64: pdfBase64 } 
            }
        });

        return NextResponse.json({
            status: true,
            message: 'Slip Generated Successfully',
            data: providerResponse.data,
            pdf_base64: pdfBase64
        });

    } catch (pdfError) {
        // Refund on PDF failure
        await prisma.$transaction([
            prisma.user.update({ where: { id: user!.id }, data: { walletBalance: { increment: COST } } }),
            prisma.serviceRequest.update({ 
                where: { id: requestLog.id }, 
                data: { status: 'FAILED', responseData: { error: 'Document Generation Failed' } } 
            })
        ]);
        return NextResponse.json({ status: false, error: 'Document Generation Failed' }, { status: 500 });
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
