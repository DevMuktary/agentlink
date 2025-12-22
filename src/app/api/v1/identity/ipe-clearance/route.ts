import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
// FIX: Import from the new NinSlip provider
import { submitIpeRequest } from '@/services/providers/ninslip-ipe';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { trackingId, reference } = await req.json();
    if (!trackingId) return NextResponse.json({ status: false, error: 'Tracking ID required' }, { status: 400 });

    // 2. Get Price
    const service = await prisma.service.findUnique({ where: { code: 'IPE_CLEARANCE' } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });
    
    const cost = Number(service.price);

    // 3. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 4. Charge & Log "PROCESSING"
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

    // 5. Submit to NinSlip
    const result = await submitIpeRequest(trackingId);

    if (result.success) {
      // Success: Keep money, keep status PROCESSING. Cron will check later.
      return NextResponse.json({ 
        status: true, 
        message: 'IPE Request Submitted Successfully',
        data: result.data,
        requestId: requestLog.id
      });
    } else {
      // Failed: Refund immediately (As per rule: "Charged only if API accepts")
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { walletBalance: { increment: cost } } }),
        prisma.serviceRequest.update({ 
          where: { id: requestLog.id }, 
          data: { status: 'FAILED', responseData: { error: result.message }, adminNote: 'Refunded: Provider rejected request.' } 
        })
      ]);
      return NextResponse.json({ status: false, error: result.message }, { status: 400 });
    }

  } catch (error) {
    console.error("IPE Route Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
