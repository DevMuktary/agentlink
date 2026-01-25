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
        serviceType: { 
          in: [
            'NIN_VALIDATION_NO_RECORD', 
            'NIN_VALIDATION_UPDATE_RECORD', 
            'NIN_VALIDATION_VNIN'
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
        adminNote: true, 
        updatedAt: true
      }
    });

    if (!request) {
      return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // 4. Construct Clean Result
    // CASE A: COMPLETED
    if (request.status === 'COMPLETED') {
        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "Validation Completed",
            data: {
                valid: true,
                message: "Validation Successful. Records have been validated."
            },
            last_updated: request.updatedAt
        });
    } 
    
    // CASE B: FAILED
    else if (request.status === 'FAILED') {
        return NextResponse.json({
            status: true,
            current_status: 'FAILED',
            message: "Validation Failed",
            data: {
                valid: false,
                message: "Validation Failed"
            },
            reason: request.adminNote || "Verification could not be completed",
            last_updated: request.updatedAt
        });
    }

    // CASE C: PROCESSING
    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: "Validation in progress",
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("Status Check Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
