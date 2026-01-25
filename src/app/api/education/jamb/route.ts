import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Parse FormData
    const formData = await req.formData();
    const getString = (key: string) => formData.get(key) as string | null;

    const service_type = getString('service_type'); // 'JAMB_ORIGINAL_RESULT', 'JAMB_ADMISSION_LETTER', etc.
    const reference = getString('reference');
    
    // 3. Common Validation
    if (!service_type) return NextResponse.json({ status: false, error: 'Missing service_type' }, { status: 400 });
    if (!reference) return NextResponse.json({ status: false, error: 'Missing reference' }, { status: 400 });

    // 4. Validate Service & Price
    const service = await prisma.service.findUnique({ where: { code: service_type as any } });
    if (!service || !service.isActive) {
        return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });
    }

    // 5. Service-Specific Validation
    const requestData: any = { clientReference: reference, service_type };
    let validationError = null;
    let descriptionDetail = '';

    if (['JAMB_ORIGINAL_RESULT', 'JAMB_ADMISSION_LETTER', 'JAMB_REGISTRATION_SLIP'].includes(service_type)) {
        // Document Services
        const full_name = getString('full_name');
        const reg_number = getString('reg_number_or_profile');
        const year = getString('year');

        if (!full_name || !reg_number || !year) {
            validationError = 'Missing: full_name, reg_number_or_profile, or year';
        }
        requestData.full_name = full_name;
        requestData.reg_number = reg_number;
        requestData.year = year;
        descriptionDetail = `${service.name} for ${reg_number} (${year})`;

    } else if (service_type === 'JAMB_PROFILE_CODE_RETRIEVAL') {
        // Retrieval Service
        const reg_number = getString('reg_number');
        const phone = getString('phone_number');
        const email = getString('email');

        // Need at least 2 identifiers to be safe, or just phone/reg
        if (!phone && !reg_number && !email) {
            validationError = 'Provide at least one: phone_number, reg_number, or email';
        }
        requestData.reg_number = reg_number;
        requestData.phone_number = phone;
        requestData.email = email;
        descriptionDetail = `JAMB Profile Retrieval (${reg_number || phone})`;
    } else {
        validationError = 'Invalid JAMB Service Type';
    }

    if (validationError) {
        return NextResponse.json({ status: false, error: validationError }, { status: 400 });
    }

    // 6. Check Balance
    const cost = Number(service.price);
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

      // B. Create Transaction Record (ADDED)
      await tx.transaction.create({
        data: {
            userId: user.id,
            amount: cost,
            type: 'SERVICE_CHARGE',
            status: 'COMPLETED',
            reference: reference, 
            description: descriptionDetail || service.name,
            serviceId: service_type
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: service_type as any,
          status: 'PROCESSING',
          cost: cost,
          requestData: requestData,
          adminNote: 'Pending Manual Processing'
        }
      });
    });

    // 8. Success Response
    return NextResponse.json({
      status: true,
      message: 'JAMB Request Submitted',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: cost,
        note: 'Admin will process and provide the document/code shortly.'
      }
    });

  } catch (error) {
    console.error("JAMB API Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
