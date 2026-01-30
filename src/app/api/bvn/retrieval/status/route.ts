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

    // 3. Build Query Dynamically (Prevents Prisma JSON Errors)
    let whereQuery: any = {
        userId: user.id,
        serviceType: { in: ['BVN_RETRIEVAL_PHONE', 'BVN_RETRIEVAL_CRM'] }
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
        id: true, 
        status: true, 
        responseData: true, 
        requestData: true, // Fetch input data to show what was searched
        adminNote: true, 
        updatedAt: true
      }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    // 5. Handle Status Responses

    // CASE A: COMPLETED (Success)
    if (request.status === 'COMPLETED') {
        const resData = request.responseData as any || {};
        const reqData = request.requestData as any || {};

        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "Retrieval Successful",
            data: {
                // The Result (BVN)
                bvn: resData.bvn || resData.number || null,
                
                // Context (What was searched)
                searched_phone: reqData.phone_number || null,
                searched_name: reqData.full_name || null,

                // Optional Evidence (If Admin uploaded it)
                image_url: resData.image_url || resData.url || resData.slip_url || null
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
            reason: request.adminNote || "Record not found",
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
