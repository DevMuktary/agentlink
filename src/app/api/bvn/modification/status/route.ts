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

    // 3. Find Request (Filter by User & BVN Mod Types)
    const request = await prisma.serviceRequest.findFirst({
      where: {
        userId: user.id,
        serviceType: { 
          in: [
            'BVN_MOD_NAME', 
            'BVN_MOD_DOB', 
            'BVN_MOD_PHONE', 
            'BVN_MOD_NAME_PHONE', 
            'BVN_MOD_DOB_PHONE', 
            'BVN_MOD_FULL'
          ] 
        },
        OR: [
            { id: requestId || undefined },
            { requestData: { path: ['clientReference'], equals: clientRef || undefined } }
        ]
      },
      select: {
        id: true,
        status: true,
        responseData: true,
        adminNote: true,
        updatedAt: true
      }
    });

    if (!request) {
      return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // 4. Construct Response
    
    // CASE A: COMPLETED
    if (request.status === 'COMPLETED') {
        const resData = request.responseData as any || {};
        
        return NextResponse.json({
            status: true,
            current_status: 'COMPLETED',
            message: "Modification Successful",
            data: {
                message: "Your data has been updated successfully.",
                // Check all possible Cloudinary field names
                slip_url: resData.slip_url || resData.image || resData.url || resData.file_url || null,
                // Sometimes admin might return the new BVN details directly
                new_details: resData.new_details || null 
            },
            last_updated: request.updatedAt
        });
    } 
    
    // CASE B: FAILED
    else if (request.status === 'FAILED') {
        return NextResponse.json({
            status: true,
            current_status: 'FAILED',
            message: "Modification Failed",
            reason: request.adminNote || "Request modification failed",
            last_updated: request.updatedAt
        });
    }

    // CASE C: PROCESSING
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
