import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Authenticate Agent
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    const body = await req.json();
    const { nin, service_code, reference } = body;

    // 2. Validate Inputs
    if (!nin || nin.length !== 11) {
      return NextResponse.json({ status: false, error: 'Invalid NIN format. Must be 11 digits.' }, { status: 400 });
    }
    
    if (!service_code) {
      return NextResponse.json({ status: false, error: "Missing 'service_code' (e.g., 329)." }, { status: 400 });
    }

    // 3. Find Service by Code
    const service = await prisma.service.findUnique({ 
        where: { serviceCode: Number(service_code) } 
    });

    // Verify it's a validation service
    if (!service || !service.isActive || 
       (service.code !== 'NIN_VALIDATION_NO_RECORD' && 
        service.code !== 'NIN_VALIDATION_UPDATE_RECORD' &&
        service.code !== 'NIN_VALIDATION_VNIN')) {
      return NextResponse.json({ status: false, error: 'Invalid or inactive Service Code.' }, { status: 404 });
    }

    const cost = Number(service.price);

    // 4. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 5. Deduct Money & Create Request (Manual Service)
    const requestLog = await prisma.$transaction(async (tx) => {
      // Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      // Create Record
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: service.code,
          status: 'PROCESSING', // Manual service stays processing
          cost: cost,
          requestData: { nin, clientReference: reference, service_code }, 
          adminNote: 'Waiting for Admin Validation'
        }
      });
    });

    return NextResponse.json({
      status: true,
      message: 'Validation Request Submitted Successfully',
      data: {
        reference: requestLog.id,
        status: 'PROCESSING',
        note: 'This is a manual service. Status will be updated within 24-72 hours.'
      }
    });

  } catch (error) {
    console.error("NIN Validation Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
