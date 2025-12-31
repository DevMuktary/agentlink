import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    if (!requestId && !clientRef) {
      return NextResponse.json({ status: false, error: 'request_id or reference is required' }, { status: 400 });
    }

    // Find Request
    let whereQuery: any = {
        userId: user.id,
        serviceType: { in: ['NIN_MODIFICATION_NAME', 'NIN_MODIFICATION_PHONE', 'NIN_MODIFICATION_ADDRESS'] }
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
        responseData: true,
        adminNote: true, // The rejection reason
        updatedAt: true
      }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    // --- CONSTRUCT RESPONSE ---
    let resultPayload = null;
    let message = "Request in progress";

    if (request.status === 'COMPLETED') {
        // SUCCESS: Must return the Image
        message = "Modification Successful";
        resultPayload = {
            success: true,
            // We expect the Admin to have saved { "image": "url..." } in responseData
            image_url: (request.responseData as any)?.image || (request.responseData as any)?.url || null,
            note: "Changes applied successfully"
        };
    } else if (request.status === 'FAILED') {
        // FAILED: Must return the Reason
        message = "Modification Failed";
        resultPayload = {
            success: false,
            // The Admin Note contains the reason (e.g., "Blurry Document", "Invalid Date")
            reason: request.adminNote || "Modification rejected by Admin"
        };
    }

    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: message,
      result: resultPayload,
      last_updated: request.updatedAt
    });

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
