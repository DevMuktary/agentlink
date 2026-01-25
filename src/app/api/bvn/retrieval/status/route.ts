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

    // 2. Validate Query
    if (!requestId && !clientRef) {
        return NextResponse.json({ status: false, error: 'request_id or reference required' }, { status: 400 });
    }

    // 3. Find Request
    const request = await prisma.serviceRequest.findFirst({
      where: {
        userId: user.id,
        serviceType: { in: ['BVN_RETRIEVAL_PHONE', 'BVN_RETRIEVAL_CRM'] },
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

    // 4. Handle Status Responses

    // CASE A: COMPLETED (Success)
    if (request.status === 'COMPLETED') {
        const resData = request.responseData as any || {};

        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "Retrieval Successful",
            data: {
                // The 11-digit BVN entered by Admin
                bvn: resData.bvn || resData.number || null,
                
                // Optional Image/Slip (Cloudinary URL)
                image_url: resData.image_url || resData.url || resData.file_url || resData.slip_url || null
            },
            last_updated: request.updatedAt
        });
    }

    // CASE B: FAILED
    else if (request.status === 'FAILED') {
        return NextResponse.json({
            status: true,
            current_status: 'FAILED',
            message: "Retrieval Failed",
            reason: request.adminNote || "Retrieval declined",
            last_updated: request.updatedAt
        });
    }

    // CASE C: PROCESSING
    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: "Request processing",
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("BVN Retrieval Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
