import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
// Ensure this path matches your provider service file
import { purchaseAirtime } from '@/services/providers/cheapdata-airtime';
import { distributeReferralCommission } from '@/services/referral.service';

// Map input network strings to your Prisma ServiceType Enum
const NETWORK_MAP: Record<string, string> = {
    'MTN': 'AIRTIME_MTN',
    'GLO': 'AIRTIME_GLO',
    'AIRTEL': 'AIRTIME_AIRTEL',
    '9MOBILE': 'AIRTIME_9MOBILE',
    'ETISALAT': 'AIRTIME_9MOBILE'
};

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { network, amount, phone_number, reference } = body;

    // 2. Validate Inputs
    if (!network || !NETWORK_MAP[network.toUpperCase()]) {
      return NextResponse.json({ status: false, error: 'Invalid Network. Use: MTN, GLO, AIRTEL, 9MOBILE' }, { status: 400 });
    }
    
    // Enforce minimum limit
    if (!amount || Number(amount) < 50) {
      return NextResponse.json({ status: false, error: 'Invalid Amount (Minimum ₦50)' }, { status: 400 });
    }
    
    if (!phone_number || phone_number.length < 11) {
      return NextResponse.json({ status: false, error: 'Invalid Phone Number' }, { status: 400 });
    }
    
    if (!reference) {
      return NextResponse.json({ status: false, error: 'Missing Reference' }, { status: 400 });
    }

    // 3. Determine Specific Service Type
    const dbServiceType = NETWORK_MAP[network.toUpperCase()]; // e.g., 'AIRTIME_MTN'

    // 4. Check Service Status (Specific to Network)
    // We now look up 'AIRTIME_MTN' instead of generic 'AIRTIME'
    const service = await prisma.service.findUnique({ 
        where: { code: dbServiceType as any } 
    });

    if (!service || !service.isActive) {
      return NextResponse.json({ status: false, error: `${network} Airtime Service Unavailable` }, { status: 503 });
    }

    // 5. Check Balance & Calculate Cost
    // Note: If you want to apply discounts based on service.price (e.g. 98%), do it here.
    // For now, we assume cost = amount as per your original code.
    const cost = Number(amount); 
    
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 6. Deduct & Log (PROCESSING)
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
          description: `Airtime: ${network} ₦${cost} -> ${phone_number}`,
          serviceId: dbServiceType // Tracking specific network usage
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: dbServiceType as any, // Saving as 'AIRTIME_MTN' etc.
          status: 'PROCESSING',
          cost: cost,
          requestData: { 
            network: network.toUpperCase(), 
            phone_number, 
            amount, 
            clientReference: reference 
          },
          adminNote: 'Automated Vending'
        }
      });
    });

    // 7. Call Provider
    const result = await purchaseAirtime(network, cost, phone_number, reference);

    if (result.success) {
      // SUCCESS: Update Request
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { 
            status: 'COMPLETED', 
            responseData: result.data || { message: 'Vending Successful' }
        }
      });

      // Distribute Referral Commission (Dashboard only, strictly skips API)


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
      // FAILED: Refund & Update Request
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
              description: `Refund: Airtime Failed (${network} ${amount})`,
              serviceId: dbServiceType
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
        error: result.error || 'Transaction Failed', 
        message: 'Transaction Failed - Wallet Refunded' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Airtime Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
