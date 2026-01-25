import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Get Params
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    if (!requestId && !clientRef) {
        return NextResponse.json({ status: false, error: 'Provide reference or request_id' }, { status: 400 });
    }

    // 3. Find Request
    const request = await prisma.serviceRequest.findFirst({
        where: {
            userId: user.id,
            // FIX: Enums cannot use 'contains'. We must use 'in' with specific Enum values.
            serviceType: { 
                in: [
                    'JAMB_ORIGINAL_RESULT',
                    'JAMB_ADMISSION_LETTER',
                    'JAMB_REGISTRATION_SLIP',
                    'JAMB_PROFILE_CODE_RETRIEVAL',
                    'JAMB_SERVICES' 
                ] 
            },
            OR: [
                { id: requestId || undefined },
                { requestData: { path: ['clientReference'], equals: clientRef || undefined } }
            ]
        }
    });

    if (!request) {
        return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // 4. Prepare Response
    let message = "Processing Request";
    let data = null;

    if (request.status === 'COMPLETED') {
        const resData = request.responseData as any || {};
        message = "Service Completed Successfully";
        
        data = {
            // OPTION A: Admin uploaded a PDF (Result/Admission Letter)
            document_url: resData.result_url || resData.file_url || resData.url || resData.pdf_url || null,
            
            // OPTION B: Admin provided a PIN/Code (Profile Code Retrieval)
            pin_code: resData.profile_code || resData.pin || resData.code || null,
        };
    } else if (request.status === 'FAILED') {
        message = "Service Failed";
    }

    // 5. Return JSON
    return NextResponse.json({
        status: true,
        current_status: request.status,
        message,
        data: data,
        service_type: request.serviceType,
        admin_note: request.adminNote,
        date: request.createdAt
    });

  } catch (error) {
    console.error("JAMB Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
