import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
// We assume this helper function performs the POST request to Robost API
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
    let responseData: any = request.responseData;
    let adminNote = null;
    
    // Extract Tracking ID from the saved request
    const trackingId = (request.requestData as any)?.trackingId;

    // Only check provider if we are still processing AND we have a tracking ID
    if (currentStatus === 'PROCESSING' && trackingId) {
       
       // Call Provider API (This helper does the POST to Robost)
       const liveResult = await checkPersonalizationStatus(trackingId);

       // FIX: Check for 'COMPLETED' (Uppercase) because the helper already normalized it
       if (liveResult.success && liveResult.status === 'COMPLETED') {
         // SUCCESS
         currentStatus = 'COMPLETED';
         responseData = liveResult.data; // This contains { photo: "...", firstName: "...", etc. }
         
         await prisma.serviceRequest.update({
           where: { id: request.id },
           data: { status: 'COMPLETED', responseData: liveResult.data }
         });

       } else if (liveResult.success === false || liveResult.status === 'FAILED') {
         // FAILED (Robost likely returned an error message)
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
       // If status is "PROCESSING", we just wait.
    }
    // ============================================================

    // 4. Construct Response
    let message = "Request processing";
    let dataPayload = null;

    if (currentStatus === 'COMPLETED') {
        message = "Personalization Successful";
        const resData = responseData || {};
        
        dataPayload = {
            tracking_id: trackingId,
            // Return the Base64 Photo directly from Robost Data
            photo_base64: resData.photo || null, 
            
            // Return other key details if available
            full_name: `${resData.firstname || ''} ${resData.surname || ''}`.trim(),
            nin: resData.nin || resData.NIN || null,
            date_of_birth: resData.birthdate || resData.dateOfBirth || null
        };
    } else if (currentStatus === 'FAILED') {
        message = "Personalization Failed";
    }

    // 5. Return JSON
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
