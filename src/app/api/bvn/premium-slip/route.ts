import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
// Ensure this path matches your actual provider implementation
import { generateBvnPremiumSlip } from '@/services/providers/dataverify-bvn'; 
import { distributeReferralCommission } from '@/services/referral.service'; 

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    const body = await req.json();
    const { bvn } = body;

    // Auto-generate reference if missing
    const reference = body.reference || `BVN-SLIP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    if (!bvn || bvn.length !== 11) {
      return NextResponse.json({ status: false, error: 'Invalid BVN Number (Must be 11 digits)' }, { status: 400 });
    }

    // 2. Get Price
    const service = await prisma.service.findUnique({ where: { code: 'BVN_PREMIUM_SLIP' } });
    
    // Default fallback if not seeded
    const serviceCost = service ? Number(service.price) : 1000;
    const isServiceActive = service ? service.isActive : true;

    if (!isServiceActive) {
      return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
    }

    // 3. Check Balance
    if (Number(user.walletBalance) < serviceCost) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 4. Deduct & Log (PROCESSING)
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
          description: `BVN Premium Slip: ${bvn}`,
          serviceId: 'BVN_PREMIUM_SLIP'
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'BVN_PREMIUM_SLIP',
          status: 'PROCESSING',
          cost: serviceCost,
          requestData: { bvn, clientReference: reference }
        }
      });
    });

    // 5. Call Provider
    const result = await generateBvnPremiumSlip(bvn);

    if (result.success) {
      // SUCCESS: Update DB & Return Data
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { 
            status: 'COMPLETED', 
            responseData: { ...result.data, pdf_base64: result.pdf_base64 } 
        }
      });

      // Distribute Referral Commission (Dashboard only, strictly skips API)
      try {
        const headersList = await headers();
        const origin = headersList.get('x-request-origin');
        distributeReferralCommission({
          refereeId: user.id,
          serviceType: 'BVN_PREMIUM_SLIP',
          serviceRequestId: requestLog.id,
          reference: reference,
          origin: origin,
        }).catch((err) => console.error('BVN Premium Slip Referral Commission Error:', err));
      } catch (err) {
        // Safe fail
      }

      return NextResponse.json({
        status: true,
        message: 'BVN Premium Slip Generated',
        data: {
            user_details: result.data,
            pdf_base64: result.pdf_base64,
            charged_amount: serviceCost,
            reference: reference
        }
      });

    } else {
      // FAILED: Refund
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
              reference: `${reference}-REFUND`, 
              description: `Refund: BVN Slip Failed (${bvn})`,
              serviceId: 'BVN_PREMIUM_SLIP'
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
        error: result.error || 'Slip Generation Failed', 
        message: 'Wallet Refunded' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("BVN Slip Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
 
