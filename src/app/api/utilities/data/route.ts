import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
// Ensure this path matches your provider logic
import { purchaseData } from '@/services/providers/cheapdata-data'; 
import { distributeReferralCommission } from '@/services/referral.service'; 

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { product_code, phone_number, reference } = body;

    // 2. Validate Input
    if (!product_code) return NextResponse.json({ status: false, error: 'Missing product_code' }, { status: 400 });
    if (!phone_number || phone_number.length < 11) return NextResponse.json({ status: false, error: 'Invalid Phone Number' }, { status: 400 });
    if (!reference) return NextResponse.json({ status: false, error: 'Missing Reference' }, { status: 400 });

    // 3. Find Plan in DB (Source of Truth)
    const plan = await prisma.dataPlan.findUnique({
        where: { productCode: product_code }
    });

    if (!plan) {
        return NextResponse.json({ status: false, error: 'Invalid Product Code. Please check available plans.' }, { status: 404 });
    }

    if (!plan.isActive) {
        return NextResponse.json({ status: false, error: 'This Data Plan is currently unavailable.' }, { status: 503 });
    }

    // 4. Check Price & Balance
    const cost = Number(plan.price);
    
    // Safety: Prevent free sales unless specifically allowed
    if (cost <= 0) {
        return NextResponse.json({ status: false, error: 'Plan configuration error (Price not set).' }, { status: 500 });
    }

    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: `Insufficient funds. Cost: ₦${cost}` }, { status: 402 });
    }

    // 5. Deduct & Log (PROCESSING)
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      // B. Create Transaction Record
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: cost,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference, 
          description: `Data: ${plan.network} ${plan.name} -> ${phone_number}`,
          serviceId: 'DATA'
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'DATA', // Ensure 'DATA' is in your Prisma Enum or use generic string if not strictly typed
          status: 'PROCESSING',
          cost: cost,
          requestData: { 
            product_code, 
            network: plan.network, 
            plan_name: plan.name, 
            phone_number, 
            clientReference: reference 
          },
          adminNote: 'Automated Data Vending'
        }
      });
    });

    // 6. Call Provider
    const result = await purchaseData(product_code, phone_number, reference);

    if (result.success) {
      // SUCCESS: Update DB & Return
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { 
            status: 'COMPLETED', 
            responseData: result.data || { message: 'Data Sent Successfully' }
        }
      });



      return NextResponse.json({
        status: true,
        message: 'Data Purchase Successful',
        data: {
            phone: phone_number,
            plan: plan.name,
            network: plan.network,
            amount: cost,
            status: 'COMPLETED',
            reference: reference
        }
      });

    } else {
      // FAILED: Refund (Atomic Transaction)
      await prisma.$transaction(async (tx) => {
        // A. Refund Wallet
        await tx.user.update({ 
            where: { id: user.id }, 
            data: { walletBalance: { increment: cost } } 
        });

        // B. Log Refund Transaction
        await tx.transaction.create({
            data: {
              userId: user.id,
              amount: cost,
              type: 'REFUND',
              status: 'COMPLETED',
              reference: `${reference}-REFUND`, 
              description: `Refund: Data Failed (${plan.network} ${plan.name})`,
              serviceId: 'DATA'
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
        error: result.error || 'Provider Error', 
        message: 'Transaction Failed - Wallet Refunded' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Data API Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
