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
    // 3. LIVE CHECK LOGIC (Lazy Update)
    // ============================================================
    let currentStatus = request.status;
    let responseData: any = request.responseData;
    let adminNote = request.adminNote;
    
    const trackingId = (request.requestData as any)?.trackingId;

    // Only check provider if we are still processing AND we have a tracking ID
    if (currentStatus === 'PROCESSING' && trackingId) {
       
       const liveResult = await checkPersonalizationStatus(trackingId);
       
       // Normalize for checks
       const pStatus = (liveResult.status || '').toLowerCase();
       const pMsg = (liveResult.message || '').toLowerCase();

       // CASE A: SUCCESS
       if (liveResult.success && pStatus === 'completed') {
         currentStatus = 'COMPLETED';
         responseData = liveResult.data; 
         
         await prisma.serviceRequest.update({
           where: { id: request.id },
           data: { status: 'COMPLETED', responseData: liveResult.data }
         });
       } 

       // CASE B: STILL PROCESSING (The Fix)
       // If the provider says "processing" or "pending", we do NOTHING.
       // We keep the local status as 'PROCESSING' and wait for the user to check again later.
       else if (
           pStatus === 'processing' || 
           pStatus === 'pending' || 
           pMsg.includes('processing') || 
           pMsg.includes('pending')
       ) {
           // Do not mark as FAILED. Do not update DB.
           currentStatus = 'PROCESSING';
       }

       // CASE C: ACTUAL FAILURE
       else if (liveResult.success === false || pStatus === 'failed') {
         currentStatus = 'FAILED';
         adminNote = liveResult.message || 'Provider Failed';
         
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
