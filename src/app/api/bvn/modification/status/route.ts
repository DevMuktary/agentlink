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

    // 3. Build Query
    let whereQuery: any = {
        userId: user.id,
        serviceType: { 
          in: [
            'BVN_MOD_NAME', 'BVN_MOD_DOB', 'BVN_MOD_PHONE', 
            'BVN_MOD_NAME_PHONE', 'BVN_MOD_DOB_PHONE', 'BVN_MOD_FULL'
          ] 
        }
    };

    if (requestId) {
        whereQuery.id = requestId;
    } else {
        whereQuery.requestData = { path: ['clientReference'], equals: clientRef };
    }

    // 4. Find Request
    const request = await prisma.serviceRequest.findFirst({
      where: whereQuery,
      select: {
        id: true, status: true, responseData: true, adminNote: true, updatedAt: true
      }
    });

    if (!request) {
      return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // 5. Construct Response
    if (request.status === 'COMPLETED') {
        const resData = request.responseData as any || {};
        
        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "Modification Successful",
            data: {
                message: "Your data has been updated successfully.",
                // FIX: Added 'resultUrl' which is what the Admin API saves
                slip_url: resData.resultUrl || resData.slip_url || resData.url || null,
                new_details: resData.new_details || null 
            },
            last_updated: request.updatedAt
        });
    } 
    
    else if (request.status === 'FAILED') {
        return NextResponse.json({
            status: true,
            current_status: 'FAILED',
            message: "Modification Failed",
            reason: request.adminNote || "Request modification failed",
            last_updated: request.updatedAt
        });
    }

    return NextResponse.json({
      status: true,
      current_status: request.status,
      message: "Request is currently being processed",
      last_updated: request.updatedAt
    });

  } catch (error) {
    console.error("BVN Mod Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
