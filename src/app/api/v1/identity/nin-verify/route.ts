import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { verifyNinWithProvider } from '@/services/providers/dataverify';

const SERVICE_COST = 100; // ₦100 per verification

export async function POST(req: Request) {
  try {
    // 1. Authenticate Agent (Security Layer)
    const user = await validateApiKey(req);
    if (!user) {
      return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    // 2. Validate Input
    const body = await req.json();
    const { nin, reference } = body;

    if (!nin || nin.length !== 11) {
      return NextResponse.json({ status: false, error: 'Invalid NIN format. Must be 11 digits.' }, { status: 400 });
    }

    // 3. Check Wallet Balance
    if (Number(user.walletBalance) < SERVICE_COST) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance.' }, { status: 402 });
    }

    // 4. TRANSACTION START: Deduct Money & Log Request
    // We deduct FIRST to prevent "free service" exploits.
    const requestLog = await prisma.$transaction(async (tx) => {
      // Deduct Balance
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: SERVICE_COST } }
      });

      // Create Pending Record
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'NIN_VERIFICATION',
          status: 'PROCESSING',
          cost: SERVICE_COST,
          requestData: { nin, clientReference: reference }, 
        }
      });
    });

    // 5. CALL SEPARATE PROVIDER LAYER
    // This calls the file in `src/services/providers/dataverify.ts`
    const result = await verifyNinWithProvider(nin);

    // 6. Handle Outcome
    if (result.success) {
      
      // A. Success: Update Record
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { 
          status: 'COMPLETED',
          responseData: result.data 
        }
      });

      return NextResponse.json({
        status: true,
        message: 'Verification Successful',
        data: result.data
      });

    } else {
      
      // B. Failed: Refund Agent & Mark Failed
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { walletBalance: { increment: SERVICE_COST } }
        }),
        prisma.serviceRequest.update({
          where: { id: requestLog.id },
          data: { 
            status: 'FAILED',
            responseData: { error: result.error },
            adminNote: 'Auto-refunded due to provider failure.'
          }
        })
      ]);

      return NextResponse.json({ 
        status: false, 
        error: result.error || 'Verification Failed',
        message: 'Your wallet has been refunded.'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("API Gateway Error:", error);
    return NextResponse.json({ status: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
