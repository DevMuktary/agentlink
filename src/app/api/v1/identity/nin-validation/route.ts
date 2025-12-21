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
    const { nin, type, reference } = body;

    // 2. Validate Inputs
    if (!nin || nin.length !== 11) {
      return NextResponse.json({ status: false, error: 'Invalid NIN format. Must be 11 digits.' }, { status: 400 });
    }
    
    if (!type || (type !== 'NO_RECORD' && type !== 'UPDATE_RECORD')) {
      return NextResponse.json({ status: false, error: "Invalid type. Use 'NO_RECORD' or 'UPDATE_RECORD'." }, { status: 400 });
    }

    // 3. Determine Service Code
    const serviceCode = type === 'NO_RECORD' 
      ? ServiceType.NIN_VALIDATION_NO_RECORD 
      : ServiceType.NIN_VALIDATION_UPDATE_RECORD;

    // 4. Get Price
    const service = await prisma.service.findUnique({ where: { code: serviceCode } });
    if (!service || !service.isActive) {
      return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
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
          serviceType: serviceCode,
          status: 'PROCESSING', // Manual service stays processing
          cost: cost,
          requestData: { nin, clientReference: reference, type }, 
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
