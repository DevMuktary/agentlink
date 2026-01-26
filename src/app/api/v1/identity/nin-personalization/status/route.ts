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

    // 2. Find Request in DB
    let whereQuery: any = {
        userId: user.id,
        serviceType: 'NIN_PERSONALIZATION'
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
        updatedAt: true,
        adminNote: true
      }
    });

    if (!request) {
      return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // ============================================================
    // 3. LIVE CHECK LOGIC (Self-Healing)
    // ============================================================
    let currentStatus = request.status;
    let responseData: any = request.responseData;
    let adminNote = request.adminNote || '';
    
    const trackingId = (request.requestData as any)?.trackingId;

    // FIX: Retry if status is PROCESSING *OR* if it FAILED with a "processing" reason
    const shouldRetry = currentStatus === 'PROCESSING' || 
                        (currentStatus === 'FAILED' && adminNote.toLowerCase().includes('processing'));

    if (shouldRetry && trackingId) {
       
       const liveResult = await checkPersonalizationStatus(trackingId);
       
       const pStatus = (liveResult.status || '').toLowerCase();
       const pMsg = (liveResult.message || '').toLowerCase();

       // CASE A: SUCCESS
       if (liveResult.success && pStatus === 'completed') {
         currentStatus = 'COMPLETED';
         responseData = liveResult.data; 
         adminNote = 'Completed';
         
         await prisma.serviceRequest.update({
           where: { id: request.id },
           data: { status: 'COMPLETED', responseData: liveResult.data, adminNote: 'Completed' }
         });
       } 

       // CASE B: STILL PROCESSING (Stay as Processing / Heal from Failed)
       else if (
           pStatus === 'processing' || 
           pStatus === 'pending' || 
           pMsg.includes('processing') || 
           pMsg.includes('pending')
       ) {
           // Force status to PROCESSING in memory (and fix DB if it was wrong)
           currentStatus = 'PROCESSING';
           
           if (request.status === 'FAILED') {
               await prisma.serviceRequest.update({
                   where: { id: request.id },
                   data: { status: 'PROCESSING', adminNote: 'Processing...' }
               });
           }
       }

       // CASE C: ACTUAL FAILURE
       else if (liveResult.success === false || pStatus === 'failed') {
         currentStatus = 'FAILED';
         adminNote = liveResult.message || 'Provider Failed';
         
         // Only update DB if it's not already FAILED with this note
         if (request.status !== 'FAILED' || request.adminNote !== adminNote) {
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

    // 4. Construct Response
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
    console.error("Personalization Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
