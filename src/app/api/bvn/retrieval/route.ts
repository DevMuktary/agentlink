import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Parse FormData
    const formData = await req.formData();
    const getString = (key: string) => formData.get(key) as string | null;

    const service_code = getString('service_code');
    const reference = getString('reference');
    
    // Category A: Phone
    const phone_number = getString('phone_number');
    const full_name = getString('full_name');

    // Category B: CRM
    const agent_code = getString('agent_code');
    const ticket_id = getString('ticket_id');
    const bms_ticket = getString('bms_ticket');
    const screenshotFile = formData.get('screenshot') as File | null; 

    // 3. Basic Validation
    if (!service_code || !reference) {
      return NextResponse.json({ status: false, error: 'Missing service_code or reference' }, { status: 400 });
    }

    // 4. Identify Service
    const service = await prisma.service.findUnique({ where: { serviceCode: Number(service_code) } });
    
    if (!service || !service.isActive || !service.code.toString().startsWith('BVN_RETRIEVAL_')) {
      return NextResponse.json({ status: false, error: 'Invalid BVN Retrieval Service Code' }, { status: 404 });
    }

    const code = service.code.toString();
    let screenshotUrl = null;
    let screenshotPublicId = null;

    // 5. CATEGORY SPECIFIC VALIDATION
    
    // --- CATEGORY A: BY PHONE (Code 630) ---
    if (code === 'BVN_RETRIEVAL_PHONE') {
        const missing = [];
        if (!phone_number) missing.push('phone_number');
        if (!full_name) missing.push('full_name'); // Now Mandatory

        if (missing.length > 0) {
            return NextResponse.json({ status: false, error: `Missing Fields for Phone Retrieval: ${missing.join(', ')}` }, { status: 400 });
        }
    }

    // --- CATEGORY B: BY CRM (Code 631) ---
    if (code === 'BVN_RETRIEVAL_CRM') {
        const missing = [];
        if (!agent_code) missing.push('agent_code');
        if (!ticket_id) missing.push('ticket_id');
        if (!bms_ticket) missing.push('bms_ticket');
        if (!screenshotFile) missing.push('screenshot (file)');

        if (missing.length > 0) {
            return NextResponse.json({ status: false, error: `Missing Fields for CRM: ${missing.join(', ')}` }, { status: 400 });
        }
        
        const upload = await uploadToCloudinary(screenshotFile!, 'agentlink/bvn_retrieval_proofs');
        screenshotUrl = upload.secure_url;
        screenshotPublicId = upload.public_id;
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
            description: `BVN Retrieval via ${code === 'BVN_RETRIEVAL_PHONE' ? 'Phone' : 'CRM'}`,
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
            
            // Phone Category
            phone_number: phone_number || null,
            full_name: full_name || null,

            // CRM Category
            agent_code: agent_code || null,
            ticket_id: ticket_id || null,
            bms_ticket: bms_ticket || null,
            
            screenshotUrl: screenshotUrl || null,
            screenshotPublicId: screenshotPublicId || null
          },
          adminNote: 'Pending Retrieval'
        }
      });
    });

    // 8. Success Response
    return NextResponse.json({
      status: true,
      message: 'Retrieval Request Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: cost,
        service: service.name
      }
    });

  } catch (error) {
    console.error("BVN Retrieval Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
