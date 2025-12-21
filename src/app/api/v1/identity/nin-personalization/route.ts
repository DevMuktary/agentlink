import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { submitPersonalization } from '@/services/providers/robost-personalization';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { trackingId, reference } = await req.json();
    if (!trackingId) return NextResponse.json({ status: false, error: 'Tracking ID required' }, { status: 400 });

    // 1. Get Price
    const service = await prisma.service.findUnique({ where: { code: 'NIN_PERSONALIZATION' } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });
    
    const cost = Number(service.price);

    // 2. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 3. Charge & Log
    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'NIN_PERSONALIZATION',
          status: 'PROCESSING',
          cost: cost,
          requestData: { trackingId, clientReference: reference }, 
        }
      });
    });

    // 4. Submit to Provider
    const result = await submitPersonalization(trackingId);

    if (result.success) {
      return NextResponse.json({ 
        status: true, 
        message: 'Request Submitted. Processing started.',
        requestId: requestLog.id
      });
    } else {
      // Refund Logic
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { walletBalance: { increment: cost } } }),
        prisma.serviceRequest.update({ 
          where: { id: requestLog.id }, 
          data: { status: 'FAILED', responseData: { error: result.message }, adminNote: 'Refunded: Submission rejected.' } 
        })
      ]);
      return NextResponse.json({ status: false, error: result.message }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
