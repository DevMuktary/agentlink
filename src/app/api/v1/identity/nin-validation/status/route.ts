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

    // 3. Find Request
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
        responseData: true,
        updatedAt: true
      }
    });

    if (!request) {
      return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // 4. Custom Logic for "Simple" Response
    let finalResult = request.responseData;

    // If COMPLETED but admin uploaded nothing, show standard success message
    if (request.status === 'COMPLETED' && !finalResult) {
        finalResult = { message: "Validation Successful" };
    }

    // If FAILED, try to show the Admin's Note or a default message
    let failureReason = null;
    if (request.status === 'FAILED') {
        failureReason = request.adminNote || (request.responseData as any)?.error || "Validation Failed";
    }

    // 5. Return Response
    return NextResponse.json({
      status: true,
      current_status: request.status,
      result: request.status === 'COMPLETED' ? finalResult : null,
      reason: failureReason, // Will be null unless FAILED
      last_updated: request.updatedAt
    });

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
