import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { generateVninSlip } from '@/services/providers/dataverify';

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

    // FIX: Auto-generate reference if missing
    const reference = body.reference || `VNIN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    if (!nin || nin.length !== 11) {
        return NextResponse.json({ status: false, error: 'Invalid NIN' }, { status: 400 });
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

    // 4. Deduct & Log
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
          description: `VNIN Slip for NIN: ${nin}`,
          serviceId: 'VNIN_SLIP'
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'VNIN_SLIP',
          status: 'PROCESSING',
          cost: serviceCost,
          requestData: { nin, clientReference: reference }, 
        }
      });
    });

    // 5. Call Provider (DataVerify)
    const result = await generateVninSlip(nin);

    if (result.success && result.data?.pdf_base64) {
      // SUCCESS: Save Result
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { 
            status: 'COMPLETED', 
            responseData: result.data // Save full provider data for admin history
        }
      });

      // RESPONSE: Clean "Slip Only" response
      return NextResponse.json({ 
          status: true, 
          message: 'VNIN Slip Generated', 
          pdf_base64: result.data.pdf_base64 
      });

    } else {
      // REFUND: Provider Failed
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
              description: `Refund: VNIN Slip Failed (${nin})`,
              serviceId: 'VNIN_SLIP'
            }
        });

        // C. Update Request Status
        await tx.serviceRequest.update({ 
            where: { id: requestLog.id }, 
            data: { status: 'FAILED', responseData: { error: result.error } } 
        });
      });

      return NextResponse.json({ status: false, error: result.error || "Failed to generate slip", message: 'Refunded' }, { status: 400 });
    }

  } catch (error) {
    console.error("VNIN Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
