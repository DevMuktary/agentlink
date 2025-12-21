import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByPhone } from '@/services/providers/robost-phone';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { phone, reference } = await req.json();
    if (!phone) return NextResponse.json({ status: false, error: 'Phone required' }, { status: 400 });

    // 1. GET DYNAMIC PRICE
    const service = await prisma.service.findUnique({ where: { code: 'NIN_SEARCH_BY_PHONE' } });
    if (!service || !service.isActive) {
      return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
    }
    const serviceCost = Number(service.price);

    if (Number(user.walletBalance) < serviceCost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: serviceCost } }
      });
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'NIN_SEARCH_BY_PHONE', // DISTINCT TYPE
          status: 'PROCESSING',
          cost: serviceCost,
          requestData: { phone, clientReference: reference }, 
        }
      });
    });

    const result = await lookupNinByPhone(phone);

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
