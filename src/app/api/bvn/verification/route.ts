import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
// Make sure this path matches your actual provider file
import { verifyBvn } from '@/services/providers/confirmident-bvn'; 

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    // 2. Parse Input
    const body = await req.json();
    const { bvn } = body;

    // Auto-generate reference if not provided
    const reference = body.reference || `BVN-VER-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 3. Validate Input
    if (!bvn || bvn.length !== 11) {
      return NextResponse.json({ status: false, error: 'Invalid BVN (Must be 11 digits)' }, { status: 400 });
    }

    // 4. Get Price
    const service = await prisma.service.findUnique({ where: { code: 'BVN_VERIFICATION' } });
    
    // Default to 100 if not seeded, but check active status
    const serviceCost = service ? Number(service.price) : 100;
    const isServiceActive = service ? service.isActive : true;

    if (!isServiceActive) {
      return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
    }

    // 5. Check Balance
    if (Number(user.walletBalance) < serviceCost) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 6. Deduct & Log (PROCESSING)
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: serviceCost } }
      });

      // B. Create Transaction Record
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

    // 7. Call Provider
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
        charged_amount: serviceCost,
        reference: reference
      });

    } else {
      // FAILED: Refund User & Update DB
      await prisma.$transaction(async (tx) => {
        // A. Refund Wallet
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
              // Use unique ref for refund to avoid collision
              reference: `${reference}-REFUND`, 
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
        message: 'Wallet Refunded' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("BVN Route Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
