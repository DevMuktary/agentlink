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

    if (!requestId && !clientRef) return NextResponse.json({ status: false, error: 'request_id or reference required' }, { status: 400 });

    const request = await prisma.serviceRequest.findFirst({
      where: {
        userId: user.id,
        serviceType: 'ANDROID_BVN_ENROLLMENT',
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

    let result = null;
    let message = "Processing Enrollment";

    if (request.status === 'COMPLETED') {
        message = "Enrollment Successful";
        result = {
            success: true,
            message: "Process Completed. Please check your registered email for NIBSS credentials."
        };
    } else if (request.status === 'FAILED') {
        message = "Enrollment Failed";
        result = { 
            success: false, 
            reason: request.adminNote || "Application Declined" 
        };
    }

    return NextResponse.json({
      status: true,
      current_status: request.status,
      message,
      result,
      last_updated: request.updatedAt
    });

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
