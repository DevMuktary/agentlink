import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Authenticate User
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Get Request ID from URL
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    if (!requestId && !clientRef) {
      return NextResponse.json({ status: false, error: 'request_id or reference is required' }, { status: 400 });
    }

    // 3. Find the Transaction
    const request = await prisma.serviceRequest.findFirst({
      where: {
        userId: user.id,
        serviceType: 'IPE_CLEARANCE',
        OR: [
          { id: requestId || undefined },
          { requestData: { path: ['clientReference'], equals: clientRef || undefined } } // JSON filter
        ]
      },
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

    // 4. Construct the Reply
    // If COMPLETED, we send the New Data (New Tracking ID).
    // If FAILED, we send the error reason.
    // If PROCESSING, we just tell them to wait.

    return NextResponse.json({
      status: true,
      current_status: request.status, // "PROCESSING", "COMPLETED", "FAILED"
      original_tracking_id: (request.requestData as any)?.trackingId,
      
      // Only show result if completed
      result: request.status === 'COMPLETED' ? request.responseData : null,
      
      // Show error if failed
      error_reason: request.status === 'FAILED' ? (request.responseData as any)?.error : null,
      
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("Check Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
