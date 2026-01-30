import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { 
      service_code, 
      reference, 
      // Individual Fields
      nin, dob, first_name, middle_name, surname,
      // Non-Individual Fields
      business_name, rc_number 
    } = body;

    // 2. Basic Checks
    if (!service_code || !reference) {
      return NextResponse.json({ status: false, error: 'Missing service_code or reference' }, { status: 400 });
    }

    // 3. Identify Service
    const service = await prisma.service.findUnique({ where: { serviceCode: Number(service_code) } });
    
    if (!service || !service.isActive || !service.code.toString().startsWith('TAX_ID_')) {
      return NextResponse.json({ status: false, error: 'Invalid Tax ID Service Code' }, { status: 404 });
    }

    const code = service.code.toString();
    
    // 4. TYPE SPECIFIC VALIDATION
    if (code === 'TAX_ID_INDIVIDUAL') {
        const missing = [];
        if (!nin) missing.push('nin');
        if (!dob) missing.push('dob');
        if (!first_name) missing.push('first_name');
        // Middle name is often optional, but if required keep it here
        if (!surname) missing.push('surname');

        if (missing.length > 0) {
            return NextResponse.json({ status: false, error: `Missing Fields for Individual: ${missing.join(', ')}` }, { status: 400 });
        }
    } 
    else if (code === 'TAX_ID_NON_INDIVIDUAL') {
        const missing = [];
        if (!business_name) missing.push('business_name');
        if (!rc_number) missing.push('rc_number');

        if (missing.length > 0) {
            return NextResponse.json({ status: false, error: `Missing Fields for Non-Individual: ${missing.join(', ')}` }, { status: 400 });
        }
    }

    const cost = Number(service.price);

    // 5. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 6. Process Transaction
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      // B. Create Transaction Record
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: cost,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference, 
          description: `Tax ID Request (${code === 'TAX_ID_INDIVIDUAL' ? 'Individual' : 'Corporate'})`,
          serviceId: service.code.toString()
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: service.code as any, // Cast to enum
          status: 'PROCESSING',
          cost: cost,
          requestData: {
            clientReference: reference,
            service_code,
            // Store fields dynamically
            nin: nin || null,
            dob: dob || null,
            first_name: first_name || null,
            middle_name: middle_name || null,
            surname: surname || null,
            business_name: business_name || null,
            rc_number: rc_number || null
          },
          adminNote: 'Pending Tax ID Generation'
        }
      });
    });

    // 7. Success Response
    return NextResponse.json({
      status: true,
      message: 'Tax ID Request Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: cost,
        service: service.name
      }
    });

  } catch (error) {
    console.error("Tax ID Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
