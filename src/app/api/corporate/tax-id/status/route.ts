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
    // We check for both Individual and Non-Individual types
    const request = await prisma.serviceRequest.findFirst({
      where: {
        userId: user.id,
        serviceType: { in: ['TAX_ID_INDIVIDUAL', 'TAX_ID_NON_INDIVIDUAL'] },
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
        const responseData = request.responseData as any;

        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "Tax ID Generated Successfully",
            data: {
                // Return the 13-digit Tax ID (Check 'tax_id' or 'tin')
                tax_id: responseData?.tax_id || responseData?.tin || null,
                
                // Return optional slip (Check URL from Cloudinary or Base64)
                slip: responseData?.slip_url || responseData?.slip_base64 || null
            },
            last_updated: request.updatedAt
        });
    }

    // CASE B: FAILED
    else if (request.status === 'FAILED') {
        return NextResponse.json({
            status: true,
            current_status: 'FAILED',
            message: "Generation Failed",
            reason: request.adminNote || 'Application rejected',
            last_updated: request.updatedAt
        });
    }

    // CASE C: PROCESSING / PENDING
    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: "Processing Request",
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("Tax ID Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
