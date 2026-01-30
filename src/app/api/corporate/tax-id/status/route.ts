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

    // 3. Build Query Dynamically (Safe JSON Search)
    let whereQuery: any = {
        userId: user.id,
        serviceType: { in: ['TAX_ID_INDIVIDUAL', 'TAX_ID_NON_INDIVIDUAL'] }
    };

    if (requestId) {
        whereQuery.id = requestId;
    } else {
        // Search inside the JSON column safely
        whereQuery.requestData = {
            path: ['clientReference'],
            equals: clientRef
        };
    }

    // 4. Find Request
    const request = await prisma.serviceRequest.findFirst({
      where: whereQuery,
      select: {
        id: true, status: true, responseData: true, adminNote: true, updatedAt: true
      }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    // 5. Handle Status Responses

    // CASE A: COMPLETED (Success)
    if (request.status === 'COMPLETED') {
        const responseData = request.responseData as any || {};

        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "Tax ID Generated Successfully",
            data: {
                // Return the Tax ID found in either field
                tax_id: responseData.tax_id || responseData.tin || responseData.bvn || responseData.number || null,
                
                // Return optional slip if uploaded
                slip: responseData.slip_url || responseData.resultUrl || responseData.url || null
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

    // CASE C: PROCESSING
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
