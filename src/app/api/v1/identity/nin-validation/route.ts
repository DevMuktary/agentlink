import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
// import { ServiceType } from '@prisma/client'; // Optional if not strict on types

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

    // 4. Verify it is a VALIDATION service
    const validCodes = [
      'NIN_VALIDATION_NO_RECORD', 
      'NIN_VALIDATION_UPDATE_RECORD', 
      'NIN_VALIDATION_VNIN'
    ];

    if (!service || !service.isActive || !validCodes.includes(service.code)) {
      return NextResponse.json({ status: false, error: 'Invalid Service Code for Validation.' }, { status: 404 });
    }

    const cost = Number(service.price);

    // 5. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 6. Deduct Money & Create Request
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
          status: 'PROCESSING', 
          cost: cost,
          requestData: { nin, clientReference: reference, service_code }, 
          adminNote: 'Pending Validation' // Internal note for you, user won't see this yet
        }
      });
    });

    // 7. Return Clean Response (No "Manual" mentions)
    return NextResponse.json({
      status: true,
      message: 'Validation Request Submitted Successfully',
      data: {
        request_id: requestLog.id, // This is the "cmjsif..." ID
        reference: reference || null, // This is their own reference
        service: service.name,
        status: 'PROCESSING',
        charged_amount: cost
      }
    });

  } catch (error) {
    console.error("NIN Validation Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
