import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { generateVninSlip } from '@/services/providers/dataverify';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { nin, reference } = await req.json();
    if (!nin || nin.length !== 11) return NextResponse.json({ status: false, error: 'Invalid NIN' }, { status: 400 });

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
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: serviceCost } }
      });
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
          pdf_base64: result.data.pdf_base64 // <--- SENDING THIS DIRECTLY
      });

    } else {
      // REFUND: Provider Failed
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { walletBalance: { increment: serviceCost } } }),
        prisma.serviceRequest.update({ 
            where: { id: requestLog.id }, 
            data: { status: 'FAILED', responseData: { error: result.error } } 
        })
      ]);
      return NextResponse.json({ status: false, error: result.error, message: 'Refunded' }, { status: 400 });
    }

  } catch (error) {
    console.error("VNIN Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
