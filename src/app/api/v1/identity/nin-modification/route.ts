import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    const body = await req.json();
    const { service_code, reference, data } = body;

    // 2. Validate Common Inputs
    if (!service_code) return NextResponse.json({ status: false, error: 'Missing service_code' }, { status: 400 });
    if (!data) return NextResponse.json({ status: false, error: 'Missing data object' }, { status: 400 });

    // 3. Identify Service & Validate Specific Fields
    let serviceType = '';
    const code = Number(service_code);

    if (code === 501) {
        // CHANGE OF NAME
        serviceType = 'NIN_MODIFICATION_NAME';
        // Basic validation: Check if new details are provided
        if (!data.nin || !data.phone_number || !data.new_details?.first_name || !data.new_details?.surname) {
            return NextResponse.json({ status: false, error: 'Missing required fields for Name Change: nin, phone_number, new_details(first_name, surname)' }, { status: 400 });
        }
    } else if (code === 502) {
        // CHANGE OF PHONE
        serviceType = 'NIN_MODIFICATION_PHONE';
        if (!data.nin || !data.full_name || !data.new_phone_number) {
            return NextResponse.json({ status: false, error: 'Missing required fields for Phone Change: nin, full_name, new_phone_number' }, { status: 400 });
        }
    } else if (code === 503) {
        // CHANGE OF ADDRESS
        serviceType = 'NIN_MODIFICATION_ADDRESS';
        if (!data.nin || !data.phone_number || !data.full_name || !data.new_address) {
            return NextResponse.json({ status: false, error: 'Missing required fields for Address Change: nin, phone_number, full_name, new_address' }, { status: 400 });
        }
    } else {
        return NextResponse.json({ status: false, error: 'Invalid service_code. Use 501 (Name), 502 (Phone), or 503 (Address).' }, { status: 400 });
    }

    // 4. Get Price
    const service = await prisma.service.findUnique({ where: { code: serviceType as any } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });

    const cost = Number(service.price);

    // 5. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 6. Process Transaction
    const requestLog = await prisma.$transaction(async (tx) => {
      // Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      // Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: serviceType as any,
          status: 'PROCESSING',
          cost: cost,
          requestData: { 
            service_code: code,
            clientReference: reference,
            ...data 
          },
          adminNote: 'Pending Modification'
        }
      });
    });

    // 7. Return Response
    return NextResponse.json({
      status: true,
      message: 'Modification Request Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference || null,
        service: service.name,
        status: 'PROCESSING',
        charged_amount: cost
      }
    });

  } catch (error) {
    console.error("Modification Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
