import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    if (!requestId && !clientRef) return NextResponse.json({ status: false, error: 'request_id or reference required' }, { status: 400 });

    const request = await prisma.serviceRequest.findFirst({
      where: {
        userId: user.id,
        serviceType: { 
            in: ['JAMB_ORIGINAL_RESULT', 'JAMB_ADMISSION_LETTER', 'JAMB_REGISTRATION_SLIP', 'JAMB_PROFILE_CODE_RETRIEVAL'] 
        },
        OR: [
            { id: requestId || undefined },
            { requestData: { path: ['clientReference'], equals: clientRef || undefined } }
        ]
      },
      select: {
        id: true, status: true, responseData: true, adminNote: true, updatedAt: true, serviceType: true
      }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    let result = null;
    let message = "Processing Request";

    if (request.status === 'COMPLETED') {
        message = "JAMB Service Completed";
        
        if (request.serviceType === 'JAMB_PROFILE_CODE_RETRIEVAL') {
            // Retrieval: Return the Code/Text
            result = {
                success: true,
                profile_code: (request.responseData as any)?.profile_code || (request.responseData as any)?.result_text,
                note: "Retrieved Successfully"
            };
        } else {
            // Documents: Return the File (Base64)
            result = {
                success: true,
                document_base64: (request.responseData as any)?.document_base64 || (request.responseData as any)?.file || null,
                note: "Document Generated"
            };
        }
    } else if (request.status === 'FAILED') {
        message = "Request Failed";
        result = { success: false, reason: request.adminNote };
    }

    return NextResponse.json({
      status: true,
      current_status: request.status,
      message,
      result,
      last_updated: request.updatedAt
    });

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
