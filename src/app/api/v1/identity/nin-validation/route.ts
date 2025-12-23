import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { ServiceType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    // 1. Authenticate Agent
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    const body = await req.json();
    const { nin, service_code, reference } = body;

    // 2. Validate Inputs
    if (!nin) {
      return NextResponse.json({ status: false, error: 'Invalid NIN/VNIN format.' }, { status: 400 });
    }
    
    if (!service_code) {
      return NextResponse.json({ status: false, error: "Missing 'service_code'. Use 329, 330, or 331." }, { status: 400 });
    }

    // 3. Find Service by Code
    const service = await prisma.service.findUnique({ 
        where: { serviceCode: Number(service_code) } 
    });

    // 4. Verify it is a VALIDATION service (Manual)
    const validCodes = [
      'NIN_VALIDATION_NO_RECORD', 
      'NIN_VALIDATION_UPDATE_RECORD', 
      'NIN_VALIDATION_VNIN' // <--- Code 331 is strictly handled here
    ];

    if (!service || !service.isActive || !validCodes.includes(service.code)) {
      return NextResponse.json({ status: false, error: 'Invalid Service Code for Validation.' }, { status: 404 });
    }

    const cost = Number(service.price);

    // 5. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 6. Deduct Money & Create Request (Manual Service)
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
          status: 'PROCESSING', // Always PROCESSING because it's manual
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
        service: service.name,
        status: 'PROCESSING',
        note: 'This is a manual service. Status will be updated by Admin.'
      }
    });

  } catch (error) {
    console.error("NIN Validation Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
