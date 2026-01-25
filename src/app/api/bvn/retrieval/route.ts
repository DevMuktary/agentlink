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
      phone_number,
      full_name,        // Optional for Phone
      agent_code,       // CRM
      ticket_id,        // CRM
      bms_ticket,       // CRM
      screenshot_base64 // CRM
    } = body;

    // 2. Basic Validation
    if (!service_code || !reference) {
      return NextResponse.json({ status: false, error: 'Missing service_code or reference' }, { status: 400 });
    }

    // 3. Identify Service
    const service = await prisma.service.findUnique({ where: { serviceCode: Number(service_code) } });
    
    if (!service || !service.isActive || !service.code.toString().startsWith('BVN_RETRIEVAL_')) {
      return NextResponse.json({ status: false, error: 'Invalid BVN Retrieval Service Code' }, { status: 404 });
    }

    // 4. CATEGORY SPECIFIC VALIDATION
    const code = service.code.toString();

    // --- CATEGORY A: BY PHONE (Code 630) ---
    if (code === 'BVN_RETRIEVAL_PHONE') {
        if (!phone_number) {
            return NextResponse.json({ status: false, error: 'Missing Required Field: phone_number' }, { status: 400 });
        }
    }

    // --- CATEGORY B: BY CRM (Code 631) ---
    if (code === 'BVN_RETRIEVAL_CRM') {
        const missing = [];
        if (!agent_code) missing.push('agent_code');
        if (!ticket_id) missing.push('ticket_id');
        if (!bms_ticket) missing.push('bms_ticket');
        if (!screenshot_base64) missing.push('screenshot_base64');

        if (missing.length > 0) {
            return NextResponse.json({ status: false, error: `Missing Fields for CRM: ${missing.join(', ')}` }, { status: 400 });
        }
        
        // Simple Base64 Check (Ensure it's a string and looks somewhat like base64)
        if (typeof screenshot_base64 !== 'string' || screenshot_base64.length < 100) {
            return NextResponse.json({ status: false, error: 'Invalid screenshot_base64 format.' }, { status: 400 });
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

      // B. Create Transaction Record (ADDED)
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
          serviceType: service.code,
          status: 'PROCESSING',
          cost: cost,
          requestData: {
            // Common
            clientReference: reference,
            service_code,
            
            // Phone Category
            phone_number: phone_number || null,
            full_name: full_name || null,

            // CRM Category
            agent_code: agent_code || null,
            ticket_id: ticket_id || null,
            bms_ticket: bms_ticket || null,
            
            // We store the image in responseData temporarily or requestData if you prefer. 
            // Storing large Base64 in JSON column is fine for now but consider S3 later.
            screenshot: screenshot_base64 || null 
          },
          adminNote: 'Pending Retrieval'
        }
      });
    });

    // 7. Success Response
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
