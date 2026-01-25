import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { verifyBvn } from '@/services/providers/confirmident-bvn';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    const body = await req.json();
    const { bvn, reference } = body;

    // 2. Validate Input
    if (!bvn || bvn.length !== 11) {
      return NextResponse.json({ status: false, error: 'Invalid BVN (Must be 11 digits)' }, { status: 400 });
    }

    // 3. Get Price (BVN_VERIFICATION)
    const service = await prisma.service.findUnique({ where: { code: 'BVN_VERIFICATION' } });
    
    // Default to 100 if not seeded yet
    const serviceCost = service ? Number(service.price) : 100;
    const isServiceActive = service ? service.isActive : true;

    if (!isServiceActive) {
      return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
    }

    // 4. Check Balance
    if (Number(user.walletBalance) < serviceCost) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 5. Deduct & Log (PROCESSING)
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: serviceCost } }
      });

      // B. Create Transaction Record (ADDED)
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: serviceCost,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference, 
          description: `BVN Verification: ${bvn}`,
          serviceId: 'BVN_VERIFICATION'
        }
      });

      // C. Create Request Log
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'BVN_VERIFICATION',
          status: 'PROCESSING',
          cost: serviceCost,
          requestData: { bvn, clientReference: reference }
        }
      });
    });

    // 6. Call Provider
    const result = await verifyBvn(bvn);

    if (result.success) {
      // SUCCESS: Update DB & Return Data
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { status: 'COMPLETED', responseData: result.data }
      });

      return NextResponse.json({
        status: true,
        message: 'BVN Verification Successful',
        data: result.data,
        charged_amount: serviceCost
      });

    } else {
      // FAILED: Refund User & Update DB (UPDATED)
      await prisma.$transaction(async (tx) => {
        // A. Refund Wallet
        await tx.user.update({ 
            where: { id: user.id }, 
            data: { walletBalance: { increment: serviceCost } } 
        });

        // B. Log Refund Transaction (ADDED)
        await tx.transaction.create({
            data: {
              userId: user.id,
              amount: serviceCost,
              type: 'REFUND',
              status: 'COMPLETED',
              reference: `${reference}-REFUND`, // Ensure unique reference
              description: `Refund: BVN Verification Failed (${bvn})`,
              serviceId: 'BVN_VERIFICATION'
            }
        });

        // C. Update Request Status
        await tx.serviceRequest.update({ 
          where: { id: requestLog.id }, 
          data: { status: 'FAILED', responseData: { error: result.error } } 
        });
      });

      return NextResponse.json({ 
        status: false, 
        error: result.error || 'Verification Failed', 
        message: 'Refunded' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("BVN Route Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
