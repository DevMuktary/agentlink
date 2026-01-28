import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Parse JSON
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ status: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const {
      parkway_wallet_id, bvn, agent_location, bank_name,
      account_number, account_name, first_name, last_name,
      email, phone_number, home_address, state_of_residence,
      date_of_birth, local_government, senatorial_district
    } = body;

    // FIX: Auto-generate reference if missing
    const reference = body.reference || `BVN-ENR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 3. Validate Required Fields
    const missingFields = [];
    if (!parkway_wallet_id) missingFields.push('parkway_wallet_id');
    if (!bvn) missingFields.push('bvn');
    if (!agent_location) missingFields.push('agent_location');
    if (!bank_name) missingFields.push('bank_name');
    if (!account_number) missingFields.push('account_number');
    if (!account_name) missingFields.push('account_name');
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');
    if (!email) missingFields.push('email');
    if (!phone_number) missingFields.push('phone_number');
    if (!home_address) missingFields.push('home_address');
    if (!state_of_residence) missingFields.push('state_of_residence');
    if (!date_of_birth) missingFields.push('date_of_birth');
    if (!local_government) missingFields.push('local_government');
    if (!senatorial_district) missingFields.push('senatorial_district');

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        status: false, 
        error: `Missing Required Fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // 4. Get Price & Check Balance
    const service = await prisma.service.findUnique({ where: { code: 'ANDROID_BVN_ENROLLMENT' } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });

    const cost = Number(service.price);

    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 5. Process Transaction
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
          description: `BVN Enrollment: ${first_name} ${last_name}`,
          serviceId: 'ANDROID_BVN_ENROLLMENT'
        }
      });

      // C. Create Service Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'ANDROID_BVN_ENROLLMENT',
          status: 'PROCESSING',
          cost: cost,
          requestData: {
            clientReference: reference,
            parkway_wallet_id,
            bvn,
            agent_location,
            bank_name,
            account_number,
            account_name,
            first_name,
            last_name,
            email,
            phone_number,
            home_address,
            state_of_residence,
            date_of_birth,
            local_government,
            senatorial_district
          },
          adminNote: 'Pending Processing'
        }
      });
    });

    // 6. Return Success
    return NextResponse.json({
      status: true,
      message: 'Enrollment Request Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: cost,
        note: 'You will receive an email from NIBSS containing your credentials upon completion.'
      }
    });

  } catch (error) {
    console.error("Enrollment Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
