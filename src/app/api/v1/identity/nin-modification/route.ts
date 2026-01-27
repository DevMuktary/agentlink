import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Parse JSON (Since no file upload is needed)
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ status: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { 
        service_code, nin, phone_number, full_name,
        new_first_name, new_surname, new_phone_number, new_address 
    } = body;

    // FIX: Auto-generate reference if missing
    const reference = body.reference || `MOD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 3. Validate Common Inputs
    if (!service_code) return NextResponse.json({ status: false, error: 'Missing service_code' }, { status: 400 });
    if (!nin) return NextResponse.json({ status: false, error: 'Missing NIN' }, { status: 400 });

    // 4. Identify Service & Validate Specific Fields
    let serviceType = '';
    const code = Number(service_code);
    const requestData: any = { service_code: code, clientReference: reference, nin, full_name };

    if (code === 501) {
        // --- CHANGE OF NAME ---
        serviceType = 'NIN_MODIFICATION_NAME';
        if (!new_first_name || !new_surname) {
            return NextResponse.json({ status: false, error: 'Missing: new_first_name, new_surname' }, { status: 400 });
        }
        requestData.new_details = { first_name: new_first_name, surname: new_surname };

    } else if (code === 502) {
        // --- CHANGE OF PHONE ---
        serviceType = 'NIN_MODIFICATION_PHONE';
        if (!new_phone_number) {
            return NextResponse.json({ status: false, error: 'Missing: new_phone_number' }, { status: 400 });
        }
        requestData.new_phone_number = new_phone_number;

    } else if (code === 503) {
        // --- CHANGE OF ADDRESS ---
        serviceType = 'NIN_MODIFICATION_ADDRESS';
        if (!new_address) {
            return NextResponse.json({ status: false, error: 'Missing: new_address' }, { status: 400 });
        }
        requestData.new_address = new_address;

    } else {
        return NextResponse.json({ status: false, error: 'Invalid service_code. Use 501, 502, or 503.' }, { status: 400 });
    }

    // 5. Get Price
    const service = await prisma.service.findUnique({ where: { code: serviceType as any } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });

    const cost = Number(service.price);

    // 6. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 7. Process Transaction
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      // B. Create Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: cost,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference, 
          description: `NIN Modification (${service.name}) - ${nin}`,
          serviceId: serviceType
        }
      });

      // C. Create Request (No Document URL needed here, Admin provides result later)
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: serviceType as any,
          status: 'PROCESSING',
          cost: cost,
          requestData: requestData,
          adminNote: 'Pending Modification'
        }
      });
    });

    // 8. Return Response
    return NextResponse.json({
      status: true,
      message: 'Modification Request Submitted',
      data: {
        request_id: requestLog.id,
        reference: reference,
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
