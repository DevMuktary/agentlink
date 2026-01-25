import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    // 2. Validate
    if (!requestId && !clientRef) {
        return NextResponse.json({ status: false, error: 'request_id or reference required' }, { status: 400 });
    }

    // 3. Find Request
    const request = await prisma.serviceRequest.findFirst({
      where: {
        userId: user.id,
        serviceType: 'VNIN_TO_NIBSS',
        OR: [
            { id: requestId || undefined },
            { requestData: { path: ['clientReference'], equals: clientRef || undefined } }
        ]
      },
      select: {
        id: true, status: true, adminNote: true, updatedAt: true
      }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    // 4. Construct Response
    
    // CASE A: COMPLETED
    if (request.status === 'COMPLETED') {
        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "Submission Successful",
            data: {
                message: "Your request has been successfully submitted to NIBSS."
            },
            last_updated: request.updatedAt
        });
    } 
    
    // CASE B: FAILED
    else if (request.status === 'FAILED') {
        return NextResponse.json({
            status: true,
            current_status: 'FAILED',
            message: "Submission Failed",
            reason: request.adminNote || "Request Rejected",
            last_updated: request.updatedAt
        });
    }

    // CASE C: PROCESSING
    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: "Processing Request",
      last_updated: request.updatedAt
    });

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
