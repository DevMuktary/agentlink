import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

// Helper to map numeric codes if needed, though we prefer string Enums now
const SERVICE_CODES = [
  'JAMB_ORIGINAL_RESULT',
  'JAMB_ADMISSION_LETTER',
  'JAMB_REGISTRATION_SLIP',
  'JAMB_PROFILE_CODE_RETRIEVAL'
];

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Parse JSON
    const body = await req.json();
    const { 
        service_type, // e.g. JAMB_ORIGINAL_RESULT
        // Group A Fields:
        full_name, reg_number, exam_year,
        // Group B Fields:
        retrieval_id 
    } = body;

    // 3. Basic Validation
    if (!service_type || !SERVICE_CODES.includes(service_type)) {
        return NextResponse.json({ status: false, error: 'Invalid or Missing Service Type' }, { status: 400 });
    }

    // 4. Get Service & Price
    const service = await prisma.service.findFirst({ where: { code: service_type } });
    if (!service || !service.isActive) {
        return NextResponse.json({ status: false, error: 'Service currently unavailable' }, { status: 503 });
    }

    // 5. Service-Specific Validation & Data Prep
    const requestData: any = {};
    let descriptionDetail = '';

    // GROUP A: Documents (Result, Admission, Slip)
    if (['JAMB_ADMISSION_LETTER', 'JAMB_ORIGINAL_RESULT', 'JAMB_REGISTRATION_SLIP'].includes(service_type)) {
        if (!full_name || !reg_number || !exam_year) {
            return NextResponse.json({ 
                status: false, 
                error: 'Missing Requirements: Full Name, Reg Number, and Exam Year are required.' 
            }, { status: 400 });
        }
        requestData.full_name = full_name;
        requestData.regNumber = reg_number; // Database standardized key
        requestData.examYear = exam_year;
        descriptionDetail = `${service.name} for ${reg_number} (${exam_year})`;
    }
    
    // GROUP B: Profile Code Retrieval
    else if (service_type === 'JAMB_PROFILE_CODE_RETRIEVAL') {
        if (!retrieval_id) {
            return NextResponse.json({ 
                status: false, 
                error: 'Missing Requirements: Please provide a Reg Number, Phone Number, or Email.' 
            }, { status: 400 });
        }
        requestData.retrieval_id = retrieval_id; // Store the ID used for lookup
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
          reference: `JAMB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          description: descriptionDetail,
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
      message: 'JAMB Request Submitted Successfully',
      data: {
        request_id: requestLog.id,
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
