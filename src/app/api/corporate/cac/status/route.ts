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
        serviceType: 'CAC_REGISTRATION',
        OR: [
            { id: requestId || undefined },
            { requestData: { path: ['clientReference'], equals: clientRef || undefined } }
        ]
      },
      select: {
        id: true, status: true, responseData: true, adminNote: true, updatedAt: true
      }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    let result = null;
    let message = "Registration in progress";

    if (request.status === 'COMPLETED') {
        message = "CAC Registration Successful";
        result = {
            success: true,
            message: "Company Successfully Registered",
            // RETURN BASE64 STRINGS
            // The Admin Dashboard will save these fields when completing the job
            certificate_base64: (request.responseData as any)?.certificate_base64 || null,
            status_report_base64: (request.responseData as any)?.status_report_base64 || null,
        };
    } else if (request.status === 'FAILED') {
        message = "Registration Failed";
        result = { success: false, reason: request.adminNote };
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
