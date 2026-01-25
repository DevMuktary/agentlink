import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByNumber } from '@/services/providers/robost-nin'; 

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { nin, reference } = await req.json();
    if (!nin || nin.length !== 11) return NextResponse.json({ status: false, error: 'Invalid NIN' }, { status: 400 });

    // 1. GET DYNAMIC PRICE
    const service = await prisma.service.findUnique({ where: { code: 'NIN_VERIFICATION' } });
    
    const serviceCost = service ? Number(service.price) : 100;
    const isServiceActive = service ? service.isActive : true;

    if (!isServiceActive) {
      return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
    }

    // 2. Check Balance
    if (Number(user.walletBalance) < serviceCost) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 3. Deduct & Log (UPDATED)
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: serviceCost } }
      });

      // B. Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: serviceCost,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference, 
          description: `NIN Verification for ${nin}`,
          serviceId: 'NIN_VERIFICATION'
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'NIN_VERIFICATION',
          status: 'PROCESSING',
          cost: serviceCost, 
          requestData: { nin, clientReference: reference }, 
        }
      });
    });

    // 4. Call Provider
    const result = await lookupNinByNumber(nin);

    if (result.success) {
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { status: 'COMPLETED', responseData: result.data }
      });
      return NextResponse.json({ status: true, message: 'Success', data: result.data });
    } else {
      // 5. Refund Logic (UPDATED)
      await prisma.$transaction(async (tx) => {
        // A. Refund Money
        await tx.user.update({ 
            where: { id: user.id }, 
            data: { walletBalance: { increment: serviceCost } } 
        });

        // B. Log Refund Transaction
        await tx.transaction.create({
            data: {
              userId: user.id,
              amount: serviceCost,
              type: 'REFUND',
              status: 'COMPLETED',
              reference: `${reference}-REFUND`, // Ensure uniqueness
              description: `Refund for failed NIN Verification: ${nin}`,
              serviceId: 'NIN_VERIFICATION'
            }
        });

        // C. Update Request Status
        await tx.serviceRequest.update({ 
            where: { id: requestLog.id }, 
            data: { status: 'FAILED', responseData: { error: result.error } } 
        });
      });

      return NextResponse.json({ status: false, error: result.error, message: 'Refunded' }, { status: 400 });
    }

  } catch (error) {
    console.error("NIN Verify Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
