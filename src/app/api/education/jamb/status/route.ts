import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    // 2. Validate Query
    if (!requestId && !clientRef) {
        return NextResponse.json({ status: false, error: 'request_id or reference required' }, { status: 400 });
    }

    // 3. Dynamic Query
    let whereQuery: any = {
        userId: user.id,
        serviceType: { 
            in: [
                'JAMB_SERVICES',
                'JAMB_ORIGINAL_RESULT', 
                'JAMB_ADMISSION_LETTER', 
                'JAMB_REGISTRATION_SLIP', 
                'JAMB_PROFILE_CODE_RETRIEVAL'
            ] 
        }
    };

    if (requestId) {
        whereQuery.id = requestId;
    } else {
        whereQuery.requestData = { path: ['clientReference'], equals: clientRef };
    }

    // 4. Find Request
    const request = await prisma.serviceRequest.findFirst({
      where: whereQuery,
      select: {
        id: true, status: true, responseData: true, adminNote: true, updatedAt: true
      }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    // 5. Handle Response
    if (request.status === 'COMPLETED') {
        const resData = request.responseData as any || {};
        
        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "JAMB Service Completed",
            data: {
                // If it was a profile code retrieval
                profile_code: resData.bvn || resData.number || resData.profile_code || null,
                
                // If it was a document service
                document_url: resData.resultUrl || resData.slip_url || resData.url || null
            },
            last_updated: request.updatedAt
        });
    } 
    
    else if (request.status === 'FAILED') {
        return NextResponse.json({
            status: true,
            current_status: 'FAILED',
            message: "Service Failed",
            reason: request.adminNote || "Request rejected",
            last_updated: request.updatedAt
        });
    }

    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: "Request is currently being processed",
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("JAMB Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
