import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByNumber } from '@/services/providers/robost-nin'; // Clean Import

const SERVICE_COST = 100;

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { nin, reference } = await req.json();

    if (!nin || nin.length !== 11) {
      return NextResponse.json({ status: false, error: 'Invalid NIN' }, { status: 400 });
    }

    if (Number(user.walletBalance) < SERVICE_COST) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // Deduct & Log
    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: SERVICE_COST } }
      });
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'NIN_VERIFICATION',
          status: 'PROCESSING',
          cost: SERVICE_COST,
          requestData: { nin, clientReference: reference }, 
        }
      });
    });

    // Call Provider (NIN Only)
    const result = await lookupNinByNumber(nin);

    if (result.success) {
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { status: 'COMPLETED', responseData: result.data }
      });
      return NextResponse.json({ status: true, message: 'Success', data: result.data });
    } else {
      // Refund Logic
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { walletBalance: { increment: SERVICE_COST } } }),
        prisma.serviceRequest.update({ where: { id: requestLog.id }, data: { status: 'FAILED', responseData: { error: result.error } } })
      ]);
      return NextResponse.json({ status: false, error: result.error, message: 'Refunded' }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
