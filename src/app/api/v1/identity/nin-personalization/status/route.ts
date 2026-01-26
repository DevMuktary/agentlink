import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { checkPersonalizationStatus } from '@/services/providers/robost-personalization';

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

    // 2. Find Request
    let whereQuery: any = { userId: user.id, serviceType: 'NIN_PERSONALIZATION' };
    if (requestId) whereQuery.id = requestId;
    else whereQuery.requestData = { path: ['clientReference'], equals: clientRef };

    const request = await prisma.serviceRequest.findFirst({
      where: whereQuery,
      select: {
        id: true,
        status: true,
        requestData: true,
        responseData: true,
        updatedAt: true,
        adminNote: true
      }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    // ============================================================
    // 3. LIVE CHECK LOGIC (Robust Version)
    // ============================================================
    let currentStatus = request.status;
    let responseData: any = request.responseData;
    let adminNote = request.adminNote;
    
    // AUTO-FIX: If DB says FAILED but reason is generic/soft, force retry
    if (currentStatus === 'FAILED') {
        const reason = (adminNote || '').toLowerCase();
        // If it failed due to timeout or processing, let's retry
        if (reason.includes('check failed') || reason.includes('processing') || reason.includes('timeout')) {
            currentStatus = 'PROCESSING';
        }
    }

    const trackingId = (request.requestData as any)?.trackingId;

    if (currentStatus === 'PROCESSING' && trackingId) {
       
       // Log to see what's actually happening in your console
       console.log(`Checking Personalization for ${trackingId}...`);
       
       let liveResult;
       try {
           liveResult = await checkPersonalizationStatus(trackingId);
           console.log("Provider Result:", liveResult); // <--- CHECK YOUR TERMINAL FOR THIS
       } catch (e) {
           console.log("Check crashed (Timeout?), keeping status as PROCESSING");
           liveResult = { success: false, message: 'Network Timeout - Retrying' };
       }
       
       const pStatus = (liveResult.status || '').toLowerCase();
       const pMsg = (liveResult.message || '').toLowerCase();

       // CASE A: SUCCESS
       if (liveResult.success && pStatus === 'completed') {
         currentStatus = 'COMPLETED';
         responseData = liveResult.data; 
         
         await prisma.serviceRequest.update({
           where: { id: request.id },
           data: { status: 'COMPLETED', responseData: liveResult.data, adminNote: 'Completed' }
         });
       } 

       // CASE B: HARD FAILURE (Only fail if provider explicitly says "failed" or specific error)
       else if (pStatus === 'failed' || pMsg.includes('not found') || pMsg.includes('invalid')) {
         currentStatus = 'FAILED';
         adminNote = liveResult.message || 'Provider Failed';
         
         if (request.status !== 'FAILED') {
            await prisma.serviceRequest.update({
                where: { id: request.id },
                data: { status: 'FAILED', responseData: { error: liveResult.message }, adminNote: adminNote }
            });
         }
       }
       
       // CASE C: EVERYTHING ELSE (Timeouts, "Check failed", "Processing")
       // We do NOTHING. We just stay in PROCESSING state.
       else {
           currentStatus = 'PROCESSING';
           // Fix DB if it was previously marked as FAILED erroneously
           if (request.status === 'FAILED') {
               await prisma.serviceRequest.update({
                   where: { id: request.id },
                   data: { status: 'PROCESSING', adminNote: 'Auto-Recovered: Processing' }
               });
           }
       }
    }
    // ============================================================

    // 4. Response
    let message = "Request processing";
    let dataPayload = null;

    if (currentStatus === 'COMPLETED') {
        message = "Personalization Successful";
        dataPayload = responseData; 
    } else if (currentStatus === 'FAILED') {
        message = "Personalization Failed";
    }

    return NextResponse.json({
      status: true,
      current_status: currentStatus,
      message: message,
      data: dataPayload, 
      reason: currentStatus === 'FAILED' ? (adminNote || "Request failed") : null,
      last_updated: new Date()
    });

  } catch (error) {
    console.error("Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
