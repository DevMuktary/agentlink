import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';
import { validateApiKey } from '@/lib/api-auth';

// Configuration from your existing provider setup
const DATAVERIFY_URL = 'https://dataverify.com.ng/developers/nin_slips/vnin_slip.php'; // Example endpoint from your code
const SERVICE_COST = 100; // Set your price per verification

export async function POST(req: Request) {
  try {
    // 1. Authenticate Agent
    const user = await validateApiKey(req);
    if (!user) {
      return NextResponse.json({ status: false, message: 'Invalid API Key' }, { status: 401 });
    }

    // 2. Validate Input
    const body = await req.json();
    const { nin, reference } = body;

    if (!nin || nin.length !== 11) {
      return NextResponse.json({ status: false, message: 'Invalid NIN format' }, { status: 400 });
    }

    // 3. Check Balance
    if (Number(user.walletBalance) < SERVICE_COST) {
      return NextResponse.json({ status: false, message: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 4. Deduct Balance & Log "Processing"
    // We use a transaction to ensure money is safe
    const requestLog = await prisma.$transaction(async (tx) => {
      // Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: SERVICE_COST } }
      });

      // Create Request Record
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'NIN_VERIFICATION',
          status: 'PROCESSING',
          cost: SERVICE_COST,
          requestData: { nin, clientReference: reference }, // Store what they sent
        }
      });
    });

    // 5. Call Provider (DataVerify)
    // Using the logic from your uploaded 'vnin-slip/route.ts'
    const apiKey = process.env.DATAVERIFY_API_KEY; 
    
    const providerRes = await axios.post(DATAVERIFY_URL, {
      api_key: apiKey,
      nin: nin
    });

    const apiData = providerRes.data;

    // 6. Handle Success/Failure
    if (apiData.status === 'success' || apiData.success === true) {
      
      // Update Record to Completed
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { 
          status: 'COMPLETED',
          responseData: apiData // Store the full result (Photo, Name, etc.)
        }
      });

      return NextResponse.json({
        status: true,
        message: 'Verification Successful',
        data: apiData
      });

    } else {
      // Failed: Refund the user
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { walletBalance: { increment: SERVICE_COST } }
        }),
        prisma.serviceRequest.update({
          where: { id: requestLog.id },
          data: { 
            status: 'FAILED',
            responseData: { error: apiData.message || 'Provider Failed' }
          }
        })
      ]);

      return NextResponse.json({ status: false, message: 'Verification Failed. You have been refunded.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ status: false, message: 'Server Error' }, { status: 500 });
  }
}
