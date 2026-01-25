import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Get Params (GET is better for Status checks)
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
            // We search across all JAMB service types
            serviceType: { contains: 'JAMB' },
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
            // We check common field names admin might use
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
        data: data, // Will be null if processing, or contain url/pin if completed
        service_type: request.serviceType,
        admin_note: request.adminNote,
        date: request.createdAt
    });

  } catch (error) {
    console.error("JAMB Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
