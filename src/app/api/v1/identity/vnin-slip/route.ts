import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { generateVninSlip } from '@/services/providers/dataverify';
import { distributeReferralCommission } from '@/services/referral.service';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ status: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { nin } = body;

    const reference = body.reference || `VNIN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    if (!nin || nin.length !== 11) {
        return NextResponse.json({ status: false, error: 'Invalid NIN format. Must be 11 digits.' }, { status: 400 });
    }

    // 2. Get Dynamic Price
    const service = await prisma.service.findUnique({ where: { code: 'VNIN_SLIP' } });
    
    // Safety Fallback
    const serviceCost = service ? Number(service.price) : 200; 
    const isServiceActive = service ? service.isActive : true;

    if (!isServiceActive) {
      return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
    }

    // 3. Check Balance
    if (Number(user.walletBalance) < serviceCost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 4. Deduct & Create Temporary Logs
    const { reqLog, transLog } = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: serviceCost } }
      });

      const transLog = await tx.transaction.create({
        data: {
          userId: user.id,
          amount: serviceCost,
          type: 'SERVICE_CHARGE',
          status: 'PROCESSING',
          reference: reference, 
          description: `VNIN Slip for NIN: ${nin}`,
          serviceId: 'VNIN_SLIP'
        }
      });

      const reqLog = await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'VNIN_SLIP',
          status: 'PROCESSING',
          cost: serviceCost,
          requestData: { nin, clientReference: reference }, 
        }
      });

      return { reqLog, transLog };
    });

    // 5. Call Provider (DataVerify)
    const result = await generateVninSlip(nin);

    if (result.success && result.data?.pdf_base64) {
      // SUCCESS: Finalize records
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transLog.id },
          data: { status: 'COMPLETED' }
        });
        await tx.serviceRequest.update({
          where: { id: reqLog.id },
          data: { status: 'COMPLETED', responseData: result.data }
        });
      });

      // Distribute Referral Commission (Dashboard only, strictly skips API)
      try {
        const headersList = await headers();
        const origin = headersList.get('x-request-origin');
        distributeReferralCommission({
          refereeId: user.id,
          serviceType: 'VNIN_SLIP',
          serviceRequestId: reqLog.id,
          reference: reference,
          origin: origin,
        }).catch((err) => console.error('VNIN Slip Referral Commission Error:', err));
      } catch (err) {
        // Safe fail
      }

      return NextResponse.json({ 
          status: true, 
          message: 'VNIN Slip Generated', 
          pdf_base64: result.data.pdf_base64 
      });

    } else {
      // FAILURE: Refund and DELETE the temporary logs so it doesn't clutter history
      await prisma.$transaction(async (tx) => {
        // Refund Wallet
        await tx.user.update({ 
            where: { id: user.id }, 
            data: { walletBalance: { increment: serviceCost } } 
        });
        // Erase the history traces entirely
        await tx.transaction.delete({ where: { id: transLog.id } });
        await tx.serviceRequest.delete({ where: { id: reqLog.id } });
      });

      // AGGRESSIVE INTERCEPTION: Catch generic provider errors and translate them to clean UX
      let errorMessage = result.error || "Failed to generate slip";
      const lowerErr = errorMessage.toLowerCase();
      
      if (
        lowerErr.includes('400') || 
        lowerErr.includes('provider connection failed') || 
        lowerErr.includes('network') ||
        lowerErr.includes('timeout')
      ) {
        errorMessage = "No record found, please check your NIN.";
      }

      return NextResponse.json({ status: false, error: errorMessage }, { status: 400 });
    }

  } catch (error) {
    console.error("VNIN Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
