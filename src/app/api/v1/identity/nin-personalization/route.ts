import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { submitPersonalization } from '@/services/providers/robost-personalization';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { trackingId } = body;
    
    // FIX: Auto-generate reference if missing (Don't force them)
    const reference = body.reference || `PERS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    if (!trackingId) return NextResponse.json({ status: false, error: 'Tracking ID required' }, { status: 400 });
    // REMOVED THE STRICT CHECK FOR REFERENCE

    // 2. Get Price
    const service = await prisma.service.findUnique({ where: { code: 'NIN_PERSONALIZATION' } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });
    
    const cost = Number(service.price);

    // 3. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 4. Charge & Log
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      // B. Create Transaction Record
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: cost,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference, 
          description: `NIN Personalization: ${trackingId}`,
          serviceId: 'NIN_PERSONALIZATION'
        }
      });

      // C. Create Request
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

    // 5. Submit to Provider
    const result = await submitPersonalization(trackingId);

    if (result.success) {
      return NextResponse.json({ 
        status: true, 
        message: 'Request Submitted. Processing started.',
        requestId: requestLog.id,
        reference: reference
      });
    } else {
      // Refund Logic
      await prisma.$transaction(async (tx) => {
        await tx.user.update({ 
            where: { id: user.id }, 
            data: { walletBalance: { increment: cost } } 
        });

        await tx.transaction.create({
            data: {
              userId: user.id,
              amount: cost,
              type: 'REFUND',
              status: 'COMPLETED',
              reference: `${reference}-REFUND`, 
              description: `Refund: Personalization Failed (${trackingId})`,
              serviceId: 'NIN_PERSONALIZATION'
            }
        });

        await tx.serviceRequest.update({ 
          where: { id: requestLog.id }, 
          data: { status: 'FAILED', responseData: { error: result.message }, adminNote: 'Refunded: Submission rejected.' } 
        });
      });

      return NextResponse.json({ status: false, error: result.message }, { status: 400 });
    }

  } catch (error) {
    console.error("Personalization Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
