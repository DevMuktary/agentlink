import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { generateBvnPremiumSlip } from '@/services/providers/dataverify-bvn';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    const body = await req.json();
    const { bvn, reference } = body;

    if (!bvn || bvn.length !== 11) {
      return NextResponse.json({ status: false, error: 'Invalid BVN Number' }, { status: 400 });
    }

    // 2. Get Price
    const service = await prisma.service.findUnique({ where: { code: 'BVN_PREMIUM_SLIP' } });
    
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
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: serviceCost } }
      });
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
      // SUCCESS: Save Result & Return PDF
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { 
            status: 'COMPLETED', 
            responseData: { ...result.data, pdf_base64: result.pdf_base64 } // Save PDF internally too
        }
      });

      return NextResponse.json({
        status: true,
        message: 'BVN Premium Slip Generated',
        data: {
            user_details: result.data,
            pdf_base64: result.pdf_base64,
            charged_amount: serviceCost
        }
      });

    } else {
      // FAILED: Refund
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { walletBalance: { increment: serviceCost } } }),
        prisma.serviceRequest.update({ 
          where: { id: requestLog.id }, 
          data: { status: 'FAILED', responseData: { error: result.error } } 
        })
      ]);

      return NextResponse.json({ 
        status: false, 
        error: result.error, 
        message: 'Refunded' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("BVN Slip Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
