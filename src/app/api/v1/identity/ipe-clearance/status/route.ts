import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
// Import the provider function to do a live check
import { checkIpeStatus } from '@/services/providers/ninslip-ipe';

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

    // 3. Find the Request in DB
    let whereQuery: any = {
        userId: user.id,
        serviceType: 'IPE_CLEARANCE'
    };

    if (requestId) {
        whereQuery.id = requestId;
    } else {
        whereQuery.requestData = { path: ['clientReference'], equals: clientRef };
    }

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

    // ============================================================
    // 4. LIVE CHECK LOGIC (The Fix)
    // If DB says PROCESSING, check with Provider immediately
    // ============================================================
    let currentStatus = request.status;
    let responseData = request.responseData;
    let errorReason = (request.responseData as any)?.error || null;
    let trackingId = (request.requestData as any)?.trackingId;

    if (currentStatus === 'PROCESSING' && trackingId) {
       console.log(`Doing Live Check for IPE: ${trackingId}`);
       
       // Call Provider API
       const liveResult = await checkIpeStatus(trackingId);

       if (liveResult.status === 'COMPLETED') {
         // UPDATE DB: Success
         currentStatus = 'COMPLETED';
         responseData = liveResult.data; // Save the new data
         
         await prisma.serviceRequest.update({
           where: { id: request.id },
           data: { status: 'COMPLETED', responseData: liveResult.data }
         });

       } else if (liveResult.status === 'FAILED') {
         // UPDATE DB: Failed
         currentStatus = 'FAILED';
         errorReason = liveResult.message;
         
         await prisma.serviceRequest.update({
           where: { id: request.id },
           data: { 
             status: 'FAILED', 
             responseData: { error: liveResult.message, reason: 'Provider Rejected' } 
           }
         });
       }
       // If still PROCESSING, we do nothing and just return PROCESSING
    }
    // ============================================================

    // 5. Construct Response with potentially UPDATED data
    return NextResponse.json({
      status: true,
      current_status: currentStatus,
      original_tracking_id: trackingId,
      // If completed, show result. If failed, show error.
      result: currentStatus === 'COMPLETED' ? responseData : null,
      error_reason: currentStatus === 'FAILED' ? errorReason : null,
      last_updated: new Date() // Just updated
    });

  } catch (error) {
    console.error("Check Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
