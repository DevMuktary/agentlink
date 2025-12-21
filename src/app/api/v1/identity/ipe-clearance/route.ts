import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { submitIpeRequest } from '@/services/providers/robost-ipe';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { trackingId, reference } = await req.json();
    if (!trackingId) return NextResponse.json({ status: false, error: 'Tracking ID required' }, { status: 400 });

    // 1. Get Price
    const service = await prisma.service.findUnique({ where: { code: 'IPE_CLEARANCE' } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });
    
    const cost = Number(service.price);

    // 2. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 3. Charge & Log "PROCESSING"
    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'IPE_CLEARANCE',
          status: 'PROCESSING',
          cost: cost,
          requestData: { trackingId, clientReference: reference }, 
        }
      });
    });

    // 4. Submit to Provider
    const result = await submitIpeRequest(trackingId);

    if (result.success) {
      // Submission OK. We keep the money. Status stays PROCESSING.
      // The Cron Job will check for the final result later.
      return NextResponse.json({ 
        status: true, 
        message: 'Request Submitted. Processing started.',
        requestId: requestLog.id
      });
    } else {
      // Submission Failed (Provider didn't accept it). REFUND.
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
