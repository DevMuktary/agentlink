import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByPhone } from '@/services/providers/robost-phone';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { phone, reference } = await req.json();
    if (!phone || phone.length < 10) return NextResponse.json({ status: false, error: 'Invalid Phone Number' }, { status: 400 });

    // 1. GET PRICE (Ensure 'nin_phone_lookup' is in your DB seed if you want distinct pricing)
    const service = await prisma.service.findUnique({ where: { code: 'NIN_SEARCH_BY_PHONE' } });
    const serviceCost = service ? Number(service.price) : 150;

    // 2. CHECK BALANCE
    if (Number(user.walletBalance) < serviceCost) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 3. DEDUCT & LOG
    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { walletBalance: { decrement: serviceCost } } });
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'NIN_SEARCH_BY_PHONE',
          status: 'PROCESSING',
          cost: serviceCost, 
          requestData: { phone, clientReference: reference }, 
        }
      });
    });

    // 4. CALL PROVIDER
    const result = await lookupNinByPhone(phone);

    if (result.success) {
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { status: 'COMPLETED', responseData: result.data }
      });
      return NextResponse.json({ status: true, message: 'Success', data: result.data });
    } else {
      // REFUND ON FAILURE
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
