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

    if (!requestId && !clientRef) {
      return NextResponse.json({ status: false, error: 'request_id or reference is required' }, { status: 400 });
    }

    let whereQuery: any = {
        userId: user.id,
        serviceType: { in: ['NIN_MODIFICATION_NAME', 'NIN_MODIFICATION_PHONE', 'NIN_MODIFICATION_ADDRESS'] }
    };

    if (requestId) whereQuery.id = requestId;
    else whereQuery.requestData = { path: ['clientReference'], equals: clientRef };

    const request = await prisma.serviceRequest.findFirst({
      where: whereQuery,
      select: {
        id: true,
        status: true,
        responseData: true,
        adminNote: true,
        updatedAt: true
      }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    // CASE A: COMPLETED
    if (request.status === 'COMPLETED') {
        const resData = request.responseData as any || {};
        // The Admin uploads the slip URL to 'resultUrl' or 'image' or 'url'
        const slipUrl = resData.resultUrl || resData.url || resData.image || null;

        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "Modification Successful",
            data: {
                message: "Changes applied successfully",
                slip_url: slipUrl // This is the file the Admin uploaded
            },
            last_updated: request.updatedAt
        });
    } 
    
    // CASE B: FAILED
    else if (request.status === 'FAILED') {
        return NextResponse.json({
            status: true,
            current_status: 'FAILED',
            message: "Modification Failed",
            reason: request.adminNote || "Modification rejected by admin",
            last_updated: request.updatedAt
        });
    }

    // CASE C: PROCESSING
    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: "Request in progress",
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
