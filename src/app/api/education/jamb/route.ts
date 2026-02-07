import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

// MAP NUMERIC CODES TO INTERNAL ENUMS
const SERVICE_MAP: Record<string, string> = {
    '901': 'JAMB_ORIGINAL_RESULT',
    '902': 'JAMB_ADMISSION_LETTER',
    '903': 'JAMB_REGISTRATION_SLIP',
    '904': 'JAMB_PROFILE_CODE_RETRIEVAL',
};

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Parse JSON
    const body = await req.json();
    const { 
        service_code, 
        reference,
        // Group A Fields:
        full_name, registration_number, exam_year,
        // Group B Fields:
        retrieval_id 
    } = body;

    // 3. Basic Validation
    if (!service_code || !reference) {
        return NextResponse.json({ status: false, error: 'Missing service_code or reference' }, { status: 400 });
    }

    const serviceType = SERVICE_MAP[service_code.toString()];
    if (!serviceType) {
        return NextResponse.json({ status: false, error: 'Invalid JAMB Service Code' }, { status: 400 });
    }

    // 4. Get Service & Price
    // FIX: Added 'as any' here to satisfy TypeScript Enum check
    const service = await prisma.service.findFirst({ where: { code: serviceType as any } });
    
    if (!service || !service.isActive) {
        return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
    }

    // 5. Service-Specific Validation & Data Prep
    const requestData: any = { clientReference: reference, service_code };
    let descriptionDetail = '';

    // GROUP A: Documents (Result, Admission, Slip)
    if (['901', '902', '903'].includes(service_code.toString())) {
        // NOW REQUIRES FULL NAME
        if (!full_name || !registration_number || !exam_year) {
            return NextResponse.json({ 
                status: false, 
                error: 'Missing Requirements: full_name, registration_number, and exam_year are required.' 
            }, { status: 400 });
        }
        requestData.full_name = full_name;
        requestData.regNumber = registration_number;
        requestData.examYear = exam_year;
        descriptionDetail = `${service.name} for ${registration_number} (${exam_year})`;
    }
    
    // GROUP B: Profile Code Retrieval
    else if (service_code.toString() === '904') {
        // NOW REQUIRES RETRIEVAL ID
        if (!retrieval_id) {
            return NextResponse.json({ 
                status: false, 
                error: 'Missing Requirement: retrieval_id (Reg No, Phone, or Email) is required.' 
            }, { status: 400 });
        }
        requestData.retrieval_id = retrieval_id; 
        descriptionDetail = `JAMB Profile Retrieval (${retrieval_id})`;
    }

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

      // B. Create Transaction Record
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: cost,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference,
          description: descriptionDetail,
          serviceId: serviceType // Ideally this should be cast if your schema enforces enums on transactions
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: serviceType as any,
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
      message: 'JAMB Request Submitted Successfully',
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
