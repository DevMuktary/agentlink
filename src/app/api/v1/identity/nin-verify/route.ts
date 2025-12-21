import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { verifyNinByNumber } from '@/services/providers/robost';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { nin, reference } = await req.json();
    if (!nin || nin.length !== 11) return NextResponse.json({ status: false, error: 'Invalid NIN' }, { status: 400 });

    // 1. GET DYNAMIC PRICE
    const service = await prisma.service.findUnique({ where: { code: 'NIN_VERIFICATION' } });
    if (!service || !service.isActive) {
      return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
    }
    const serviceCost = Number(service.price);

    // 2. Check Balance
    if (Number(user.walletBalance) < serviceCost) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 3. Deduct & Log
    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: serviceCost } }
      });
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'NIN_VERIFICATION',
          status: 'PROCESSING',
          cost: serviceCost, // Save the cost at time of purchase
          requestData: { nin, clientReference: reference }, 
        }
      });
    });

    const result = await verifyNinByNumber(nin);

    if (result.success) {
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { status: 'COMPLETED', responseData: result.data }
      });
      return NextResponse.json({ status: true, message: 'Success', data: result.data });
    } else {
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { walletBalance: { increment: serviceCost } } }),
        prisma.serviceRequest.update({ where: { id: requestLog.id }, data: { status: 'FAILED', responseData: { error: result.error } } })
      ]);
      return NextResponse.json({ status: false, error: result.error, message: 'Refunded' }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
