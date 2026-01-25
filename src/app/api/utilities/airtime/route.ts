import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { purchaseAirtime } from '@/services/providers/cheapdata-airtime';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { network, amount, phone_number, reference } = body;

    // 2. Validate Inputs
    if (!network || !['MTN', 'GLO', 'AIRTEL', '9MOBILE', 'ETISALAT'].includes(network.toUpperCase())) {
      return NextResponse.json({ status: false, error: 'Invalid or Missing Network (MTN, GLO, AIRTEL, 9MOBILE)' }, { status: 400 });
    }
    if (!amount || Number(amount) < 50) {
      return NextResponse.json({ status: false, error: 'Invalid Amount (Minimum 50)' }, { status: 400 });
    }
    if (!phone_number || phone_number.length < 11) {
      return NextResponse.json({ status: false, error: 'Invalid Phone Number' }, { status: 400 });
    }
    if (!reference) {
      return NextResponse.json({ status: false, error: 'Missing Reference' }, { status: 400 });
    }

    // 3. Check Service Status (AIRTIME)
    const service = await prisma.service.findUnique({ where: { code: 'AIRTIME' } });
    if (!service || !service.isActive) {
      return NextResponse.json({ status: false, error: 'Airtime Service Unavailable' }, { status: 503 });
    }

    // 4. Check Balance
    const cost = Number(amount);
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 5. Deduct & Log (PROCESSING)
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      // B. Create Transaction Record (ADDED)
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: cost,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference, 
          description: `Airtime: ${network} ₦${cost} for ${phone_number}`,
          serviceId: 'AIRTIME'
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'AIRTIME',
          status: 'PROCESSING',
          cost: cost,
          requestData: { 
            network, 
            phone_number, 
            amount, 
            clientReference: reference 
          },
          adminNote: 'Automated Vending'
        }
      });
    });

    // 6. Call Provider
    const result = await purchaseAirtime(network, cost, phone_number, reference);

    if (result.success) {
      // SUCCESS: Update DB & Return
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { 
            status: 'COMPLETED', 
            responseData: result.data 
        }
      });

      return NextResponse.json({
        status: true,
        message: 'Airtime Purchase Successful',
        data: {
            network: network.toUpperCase(),
            phone: phone_number,
            amount: cost,
            status: 'COMPLETED',
            reference: reference
        }
      });

    } else {
      // FAILED: Refund & Update DB (UPDATED)
      await prisma.$transaction(async (tx) => {
        // A. Refund Wallet
        await tx.user.update({ 
            where: { id: user.id }, 
            data: { walletBalance: { increment: cost } } 
        });

        // B. Log Refund Transaction (ADDED)
        await tx.transaction.create({
            data: {
              userId: user.id,
              amount: cost,
              type: 'REFUND',
              status: 'COMPLETED',
              reference: `${reference}-REFUND`, // Ensure unique reference
              description: `Refund: Airtime Failed (${network} ${amount})`,
              serviceId: 'AIRTIME'
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
        error: result.error, 
        message: 'Transaction Failed - Wallet Refunded' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Airtime Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
