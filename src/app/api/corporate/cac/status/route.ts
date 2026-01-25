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

    // 3. Find Request
    const request = await prisma.serviceRequest.findFirst({
      where: {
        userId: user.id,
        serviceType: 'CAC_REGISTRATION',
        OR: [
            { id: requestId || undefined },
            { requestData: { path: ['clientReference'], equals: clientRef || undefined } }
        ]
      },
      select: {
        id: true, status: true, responseData: true, adminNote: true, updatedAt: true
      }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    // 4. Handle Status Responses
    
    // CASE A: COMPLETED (Success)
    if (request.status === 'COMPLETED') {
        const responseData = request.responseData as any;
        
        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "CAC Registration Successful",
            data: {
                // We check for both URL (Cloudinary) or Base64 (Legacy/Manual)
                certificate: responseData?.certificate_url || responseData?.certificate_base64 || null,
                status_report: responseData?.status_report_url || responseData?.status_report_base64 || null,
            },
            last_updated: request.updatedAt
        });
    } 
    
    // CASE B: FAILED
    else if (request.status === 'FAILED') {
        return NextResponse.json({
            status: true, // API call was successful, but the job failed
            current_status: 'FAILED',
            message: "Registration Failed",
            reason: request.adminNote || 'Application rejected by CAC',
            last_updated: request.updatedAt
        });
    }

    // CASE C: PROCESSING / PENDING
    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: "Registration in progress",
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("CAC Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
