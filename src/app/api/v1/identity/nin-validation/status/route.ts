import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Authenticate (Checks Bearer Secret Key)
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    // 2. Get Params
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    if (!requestId && !clientRef) {
      return NextResponse.json({ status: false, error: 'request_id or reference is required' }, { status: 400 });
    }

    // 3. Find the Request
    let whereQuery: any = {
        userId: user.id,
        serviceType: { in: ['NIN_VALIDATION_NO_RECORD', 'NIN_VALIDATION_UPDATE_RECORD', 'NIN_VALIDATION_VNIN'] }
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
        adminNote: true, 
        updatedAt: true
      }
    });

    if (!request) {
      return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // 4. Construct Clean Result (No "Admin" mentions)
    let resultPayload = null;
    let message = "Validation in progress";

    if (request.status === 'COMPLETED') {
        message = "Transaction Completed";
        resultPayload = {
            valid: true,
            message: "Validation Successful"
        };
    } else if (request.status === 'FAILED') {
        message = "Transaction Failed";
        resultPayload = {
            valid: false,
            message: "Validation Failed",
            // We use the adminNote as the specific reason (e.g. "Details mismatch"), 
            // but we display it as a generic system reason.
            reason: request.adminNote || "Verification could not be completed" 
        };
    }

    // 5. Return Response
    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: message,
      result: resultPayload,
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("Status Check Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
