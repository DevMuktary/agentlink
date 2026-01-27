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
    // 3. LIVE CHECK LOGIC (FINAL FIX)
    // ============================================================
    let currentStatus = request.status;
    let responseData: any = request.responseData;
    let adminNote = request.adminNote;
    
    // AUTO-RECOVERY: If DB says FAILED but reason is "Check failed" or "processing", force retry
    if (currentStatus === 'FAILED') {
        const reason = (adminNote || '').toLowerCase();
        if (reason.includes('check failed') || reason.includes('processing') || reason.includes('pending')) {
            currentStatus = 'PROCESSING';
        }
    }

    const trackingId = (request.requestData as any)?.trackingId;

    if (currentStatus === 'PROCESSING' && trackingId) {
       
       let liveResult;
       try {
           liveResult = await checkPersonalizationStatus(trackingId);
       } catch (e) {
           // Treat unexpected crashes as a soft fail (Processing)
           liveResult = { success: false, message: 'Check failed' }; 
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

       // CASE B: SOFT FAIL (Processing, Pending, or Generic "Check failed")
       // We FORCE these to be PROCESSING. We do not accept them as failures.
       else if (
           pMsg.includes('processing') || 
           pMsg.includes('pending') || 
           pMsg.includes('check failed') || // <--- ADDED THIS
           pStatus === 'processing'
       ) {
           currentStatus = 'PROCESSING';
           
           // Fix DB if it was previously marked FAILED
           if (request.status === 'FAILED') {
               await prisma.serviceRequest.update({
                   where: { id: request.id },
                   data: { status: 'PROCESSING', adminNote: 'Processing...' }
               });
           }
       }

       // CASE C: HARD FAILURE (Specific errors only)
       // Only fail if message explicitly says "not found", "invalid", or "error"
       else if (liveResult.success === false || pStatus === 'failed') {
         currentStatus = 'FAILED';
         adminNote = liveResult.message || 'Provider Failed';
         
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
