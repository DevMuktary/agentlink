import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { generateSlipV2, SlipTier } from '@/services/providers/slipapi-v2';
import { distributeReferralCommission } from '@/services/referral.service';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { nin, slip_type, reference } = body;

    // 1. Validation
    if (!nin || nin.length !== 11) {
        return NextResponse.json({ status: false, error: 'Valid 11-digit NIN required' }, { status: 400 });
    }
    const validTypes = ['PREMIUM', 'STANDARD', 'REGULAR'];
    if (!slip_type || !validTypes.includes(slip_type)) {
        return NextResponse.json({ status: false, error: 'Invalid slip_type' }, { status: 400 });
    }

    // 2. Map to V2 Service Codes
    let serviceCode = '';
    if (slip_type === 'PREMIUM') serviceCode = 'NIN_SLIP_V2_PREMIUM';
    else if (slip_type === 'STANDARD') serviceCode = 'NIN_SLIP_V2_STANDARD';
    else serviceCode = 'NIN_SLIP_V2_REGULAR';

    // 3. Check Price & Status
    const service = await prisma.service.findUnique({ where: { code: serviceCode as any } });
    
    if (!service) {
        return NextResponse.json({ status: false, error: 'Service not configured' }, { status: 400 });
    }
    if (!service.isActive) {
        return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
    }

    const cost = Number(service.price);
    if (Number(user.walletBalance) < cost) {
        return NextResponse.json({ status: false, error: 'Insufficient Funds' }, { status: 402 });
    }

    // 4. Process
    const apiResult = await generateSlipV2(nin, slip_type as SlipTier, 'NIN');

    if (!apiResult.success) {
        return NextResponse.json({ status: false, error: apiResult.error }, { status: 400 });
    }

    // 5. Charge & Log
    const [_, __, requestLog] = await prisma.$transaction([
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
                description: `NIN Slip V2: ${slip_type} for ${nin}`,
                serviceId: serviceCode
            }
        }),
        prisma.serviceRequest.create({
            data: {
                userId: user.id,
                serviceType: serviceCode as any,
                status: 'COMPLETED',
                cost: cost,
                requestData: { nin, type: slip_type, mode: 'NIN' }
            }
        })
    ]);

    // Distribute Referral Commission (Dashboard only, strictly skips API)
    try {
      const headersList = await headers();
      const origin = headersList.get('x-request-origin');
      distributeReferralCommission({
        refereeId: user.id,
        serviceType: serviceCode as any,
        serviceRequestId: requestLog.id,
        reference: reference,
        origin: origin,
      }).catch((err) => console.error('NIN Slip V2 Referral Commission Error:', err));
    } catch (err) {
      // Safe fail
    }

    return NextResponse.json({
        status: true,
        message: 'Slip Generated Successfully',
        data: {
            slip_type: slip_type,
            nin: nin,
            pdf_base64: apiResult.data 
        }
    });

  } catch (error: any) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
