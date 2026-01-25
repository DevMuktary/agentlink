import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
// Import the provider checker
import { checkIpeStatus } from '@/services/providers/ninslip-ipe';

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    if (!requestId && !clientRef) {
      return NextResponse.json({ status: false, error: 'request_id or reference is required' }, { status: 400 });
    }

    // 2. Find Request in DB
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
    // 3. LIVE CHECK LOGIC (Lazy Update)
    // ============================================================
    let currentStatus = request.status;
    let responseData = request.responseData;
    let adminNote = null;
    
    // Extract Tracking ID from the saved request
    const trackingId = (request.requestData as any)?.trackingId;

    // Only check provider if we are still processing AND we have a tracking ID
    if (currentStatus === 'PROCESSING' && trackingId) {
       
       // Call Provider API
       const liveResult = await checkIpeStatus(trackingId);

       if (liveResult.status === 'COMPLETED') {
         // SUCCESS: Update DB
         currentStatus = 'COMPLETED';
         responseData = liveResult.data; 
         
         await prisma.serviceRequest.update({
           where: { id: request.id },
           data: { status: 'COMPLETED', responseData: liveResult.data }
         });

       } else if (liveResult.status === 'FAILED') {
         // FAILED: Update DB (No Refund logic here as requested)
         currentStatus = 'FAILED';
         adminNote = liveResult.message || 'Provider Rejected';
         
         await prisma.serviceRequest.update({
           where: { id: request.id },
           data: { 
             status: 'FAILED', 
             responseData: { error: liveResult.message },
             adminNote: adminNote
           }
         });
       }
       // If 'PENDING', we do nothing and wait.
    }
    // ============================================================

    // 4. Construct Response
    let message = "Request processing";
    let dataPayload = null;

    if (currentStatus === 'COMPLETED') {
        message = "Clearance Successful";
        const resData = responseData as any || {};
        dataPayload = {
            tracking_id: trackingId,
            // Return the slip URL or base64 from provider
            slip_url: resData.slip_url || resData.url || resData.file_url || null,
            download_url: resData.download_url || null
        };
    } else if (currentStatus === 'FAILED') {
        message = "Clearance Failed";
    }

    // 5. Return JSON
    return NextResponse.json({
      status: true,
      current_status: currentStatus,
      message: message,
      data: dataPayload, // Contains slip if success
      reason: currentStatus === 'FAILED' ? (adminNote || "Clearance failed") : null,
      last_updated: new Date()
    });

  } catch (error) {
    console.error("IPE Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
