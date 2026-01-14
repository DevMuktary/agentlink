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
      // Document Fields
      full_name,
      reg_number_or_profile,
      year,
      // Retrieval Fields
      reg_number,
      phone_number,
      email
    } = body;

    // 2. Validate Service Code
    if (!service_code || !reference) {
      return NextResponse.json({ status: false, error: 'Missing service_code or reference' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { serviceCode: Number(service_code) } });
    if (!service || !service.isActive || !service.code.toString().startsWith('JAMB_')) {
      return NextResponse.json({ status: false, error: 'Invalid JAMB Service Code' }, { status: 404 });
    }

    const code = service.code.toString();

    // 3. VALIDATION LOGIC
    
    // CASE A: DOCUMENTS (Result, Admission, Registration)
    if (['JAMB_ORIGINAL_RESULT', 'JAMB_ADMISSION_LETTER', 'JAMB_REGISTRATION_SLIP'].includes(code)) {
        const missing = [];
        if (!full_name) missing.push('full_name');
        if (!reg_number_or_profile) missing.push('reg_number_or_profile');
        if (!year) missing.push('year');

        if (missing.length > 0) {
            return NextResponse.json({ status: false, error: `Missing Fields: ${missing.join(', ')}` }, { status: 400 });
        }
    }

    // CASE B: PROFILE CODE RETRIEVAL (Any 2 of 3)
    else if (code === 'JAMB_PROFILE_CODE_RETRIEVAL') {
        let providedCount = 0;
        if (reg_number) providedCount++;
        if (phone_number) providedCount++;
        if (email) providedCount++;

        if (providedCount < 2) {
            return NextResponse.json({ 
                status: false, 
                error: 'Profile Retrieval requires at least TWO of: reg_number, phone_number, email' 
            }, { status: 400 });
        }
    }

    // 4. Check Price & Balance
    const cost = Number(service.price);
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 5. Process Transaction
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
          serviceType: service.code,
          status: 'PROCESSING',
          cost: cost,
          requestData: {
            service_name: service.name,
            clientReference: reference,
            // Store Document Fields
            full_name: full_name || null,
            reg_number_or_profile: reg_number_or_profile || null,
            year: year || null,
            // Store Retrieval Fields
            reg_number: reg_number || null,
            phone_number: phone_number || null,
            email: email || null
          },
          adminNote: 'Pending Manual Processing'
        }
      });
    });

    // 6. Success Response
    return NextResponse.json({
      status: true,
      message: 'JAMB Request Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: cost,
        service: service.name,
        note: 'Admin will process this request.'
      }
    });

  } catch (error) {
    console.error("JAMB API Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
