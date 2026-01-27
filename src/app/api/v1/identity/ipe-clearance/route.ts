import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { submitIpeRequest } from '@/services/providers/ninslip-ipe';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { trackingId } = body;
    
    // Auto-generate reference if missing
    const reference = body.reference || `IPE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    if (!trackingId) return NextResponse.json({ status: false, error: 'Tracking ID required' }, { status: 400 });

    // 2. Get Price
    const service = await prisma.service.findUnique({ where: { code: 'IPE_CLEARANCE' } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });
    
    const cost = Number(service.price);

    // 3. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 4. Charge & Log
    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: cost,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference, 
          description: `IPE Clearance: ${trackingId}`,
          serviceId: 'IPE_CLEARANCE'
        }
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

    // 5. Submit to S8V
    const result = await submitIpeRequest(trackingId);

    if (result.success) {
      // SUCCESS: Keep Processing
      return NextResponse.json({ 
        status: true, 
        message: 'IPE Request Submitted. Check status later.',
        requestId: requestLog.id,
        reference: reference
      });
    } else {
      // FAILED: Refund
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
              description: `Refund: IPE Clearance Failed (${trackingId})`,
              serviceId: 'IPE_CLEARANCE'
            }
        });

        await tx.serviceRequest.update({ 
          where: { id: requestLog.id }, 
          data: { status: 'FAILED', responseData: { error: result.message }, adminNote: 'Refunded: Provider rejected request.' } 
        });
      });

      return NextResponse.json({ status: false, error: result.message }, { status: 400 });
    }

  } catch (error) {
    console.error("IPE Route Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
