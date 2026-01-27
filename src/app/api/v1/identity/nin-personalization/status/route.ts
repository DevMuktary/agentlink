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
    // 3. LIVE CHECK LOGIC (Specific Fix for "Failed: Processing")
    // ============================================================
    let currentStatus = request.status;
    let responseData: any = request.responseData;
    let adminNote = request.adminNote;
    
    // AUTO-FIX: If DB is stuck on FAILED but reason is "processing", force retry
    if (currentStatus === 'FAILED' && (adminNote?.toLowerCase().includes('processing') || adminNote?.toLowerCase().includes('pending'))) {
        currentStatus = 'PROCESSING';
    }

    const trackingId = (request.requestData as any)?.trackingId;

    if (currentStatus === 'PROCESSING' && trackingId) {
       
       let liveResult;
       try {
           liveResult = await checkPersonalizationStatus(trackingId);
       } catch (e) {
           liveResult = { success: false, message: 'processing' }; // Treat timeout as processing
       }
       
       const pStatus = (liveResult.status || '').toLowerCase();
       const pMsg = (liveResult.message || '').toLowerCase();

       // --- LOGIC START ---

       // 1. SUCCESS CASE
       if (liveResult.success && pStatus === 'completed') {
         currentStatus = 'COMPLETED';
         responseData = liveResult.data; 
         
         await prisma.serviceRequest.update({
           where: { id: request.id },
           data: { status: 'COMPLETED', responseData: liveResult.data, adminNote: 'Completed' }
         });
       } 

       // 2. PROCESSING CASE (The Important Part)
       // If message contains "processing", we FORCE status to PROCESSING, 
       // even if the provider sent "status: failed" or "success: false".
       else if (pMsg.includes('processing') || pMsg.includes('pending') || pStatus === 'processing') {
           
           currentStatus = 'PROCESSING';
           
           // If DB was erroneously marked FAILED, fix it.
           if (request.status === 'FAILED') {
               await prisma.serviceRequest.update({
                   where: { id: request.id },
                   data: { status: 'PROCESSING', adminNote: 'Processing...' }
               });
           }
       }

       // 3. ACTUAL FAILURE CASE
       // Only fail if it is NOT processing
       else if (liveResult.success === false || pStatus === 'failed') {
         currentStatus = 'FAILED';
         adminNote = liveResult.message || 'Provider Failed';
         
         // Update DB to Failed
         if (request.status !== 'FAILED') {
            await prisma.serviceRequest.update({
                where: { id: request.id },
                data: { 
                    status: 'FAILED', 
                    responseData: { error: liveResult.message },
                    adminNote: adminNote
                }
            });
         }
       }
       // --- LOGIC END ---
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
