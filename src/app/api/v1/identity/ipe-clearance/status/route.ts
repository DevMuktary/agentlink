import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Authenticate User
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Get Params
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    if (!requestId && !clientRef) {
      return NextResponse.json({ status: false, error: 'request_id or reference is required' }, { status: 400 });
    }

    // 3. Construct Query (Fixing the Prisma Error)
    // We build the 'where' clause dynamically instead of using 'OR'
    let whereQuery: any = {
        userId: user.id,
        serviceType: 'IPE_CLEARANCE'
    };

    if (requestId) {
        // Priority 1: Search by ID (Faster)
        whereQuery.id = requestId;
    } else {
        // Priority 2: Search by Reference (JSON Filter)
        // Only applies if no ID is provided
        whereQuery.requestData = {
            path: ['clientReference'],
            equals: clientRef
        };
    }

    // 4. Find the Request
    const request = await prisma.serviceRequest.findFirst({
      where: whereQuery,
      select: {
        id: true,
        status: true,
        requestData: true,
        responseData: true,
        updatedAt: true
      }
    });

    if (!request) {
      return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // 5. Construct Response
    return NextResponse.json({
      status: true,
      current_status: request.status,
      original_tracking_id: (request.requestData as any)?.trackingId,
      result: request.status === 'COMPLETED' ? request.responseData : null,
      error_reason: request.status === 'FAILED' ? (request.responseData as any)?.error : null,
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("Check Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
