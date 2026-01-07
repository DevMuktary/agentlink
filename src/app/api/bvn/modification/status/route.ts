import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Get Params
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    if (!requestId && !clientRef) {
      return NextResponse.json({ status: false, error: 'request_id or reference is required' }, { status: 400 });
    }

    // 3. Find Request (Filter by User & BVN Mod Types)
    let whereQuery: any = {
        userId: user.id,
        serviceType: { 
          in: [
            'BVN_MOD_NAME', 
            'BVN_MOD_DOB', 
            'BVN_MOD_PHONE', 
            'BVN_MOD_NAME_PHONE', 
            'BVN_MOD_DOB_PHONE', 
            'BVN_MOD_FULL'
          ] 
        }
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
        adminNote: true, // This is where the Rejection Reason lives
        updatedAt: true
      }
    });

    if (!request) {
      return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // 4. Construct Response
    let resultPayload = null;
    let message = "Request is currently being processed";

    if (request.status === 'COMPLETED') {
        message = "Modification Successful";
        resultPayload = {
            success: true,
            message: "Your data has been updated/modified successfully.",
            // If admin uploaded a proof/slip, we show it
            document_url: (request.responseData as any)?.image || (request.responseData as any)?.url || null
        };
    } else if (request.status === 'FAILED') {
        message = "Modification Failed";
        resultPayload = {
            success: false,
            // Show the exact reason the admin wrote
            reason: request.adminNote || "Request declined by Administrator"
        };
    }

    // 5. Return JSON
    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: message,
      result: resultPayload,
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("BVN Mod Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
