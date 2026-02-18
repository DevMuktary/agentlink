import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { generateSlipV2, SlipTier } from '@/services/providers/slipapi-v2';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { phone_number, slip_type, reference } = body;

    // Validate Input
    if (!phone_number || phone_number.length < 11) {
        return NextResponse.json({ status: false, error: 'Valid Phone Number required' }, { status: 400 });
    }
    
    const validTypes = ['PREMIUM', 'STANDARD', 'REGULAR'];
    if (!slip_type || !validTypes.includes(slip_type)) {
        return NextResponse.json({ status: false, error: 'Invalid slip_type. Use PREMIUM, STANDARD, or REGULAR' }, { status: 400 });
    }

    // Map Service Code
    let serviceCode = '';
    if (slip_type === 'PREMIUM') serviceCode = 'NIN_SLIP_V2_PHONE_PREMIUM';
    else if (slip_type === 'STANDARD') serviceCode = 'NIN_SLIP_V2_PHONE_STANDARD';
    else serviceCode = 'NIN_SLIP_V2_PHONE_REGULAR';

    // Check Service & Price
    const service = await prisma.service.findUnique({ where: { code: serviceCode as any } });
    if (!service) return NextResponse.json({ status: false, error: 'Service not configured' }, { status: 400 });
    
    const cost = Number(service.price);
    if (Number(user.walletBalance) < cost) {
        return NextResponse.json({ status: false, error: 'Insufficient Funds' }, { status: 402 });
    }

    // Call Provider
    const apiResult = await generateSlipV2(phone_number, slip_type as SlipTier, 'PHONE');

    if (!apiResult.success) {
        return NextResponse.json({ status: false, error: apiResult.error }, { status: 400 });
    }

    // Deduct & Log
    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { walletBalance: { decrement: cost } }
        }),
        prisma.transaction.create({
            data: {
                userId: user.id,
                amount: cost,
                type: 'SERVICE_CHARGE',
                status: 'COMPLETED',
                reference: reference,
                description: `NIN Slip V2 Phone (${slip_type}) - ${phone_number}`,
                serviceId: serviceCode
            }
        }),
        prisma.serviceRequest.create({
            data: {
                userId: user.id,
                serviceType: serviceCode as any,
                status: 'COMPLETED',
                cost: cost,
                requestData: { phone: phone_number, type: slip_type, mode: 'PHONE' }
            }
        })
    ]);

    return NextResponse.json({
        status: true,
        message: 'Slip Generated Successfully',
        data: {
            slip_type: slip_type,
            phone: phone_number,
            pdf_base64: apiResult.data
        }
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
