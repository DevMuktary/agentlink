import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { checkIpeStatus } from '@/services/providers/ninslip-ipe';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    if (!requestId && !clientRef) {
      return NextResponse.json({ status: false, error: 'request_id or reference required' }, { status: 400 });
    }

    // Find Request
    let whereQuery: any = { userId: user.id, serviceType: 'IPE_CLEARANCE' };
    if (requestId) whereQuery.id = requestId;
    else whereQuery.requestData = { path: ['clientReference'], equals: clientRef };

    const request = await prisma.serviceRequest.findFirst({
      where: whereQuery,
      select: { id: true, status: true, requestData: true, responseData: true, updatedAt: true, adminNote: true }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });

    // --- LIVE STATUS CHECK ---
    let currentStatus = request.status;
    let responseData = request.responseData;
    let adminNote = request.adminNote;
    const trackingId = (request.requestData as any)?.trackingId;

    if (currentStatus === 'PROCESSING' && trackingId) {
        
        const liveResult = await checkIpeStatus(trackingId);

        if (liveResult.success && liveResult.status === 'COMPLETED') {
            currentStatus = 'COMPLETED';
            responseData = liveResult.data;
            await prisma.serviceRequest.update({
                where: { id: request.id },
                data: { status: 'COMPLETED', responseData: liveResult.data }
            });
        } 
        else if (liveResult.success && liveResult.status === 'FAILED') {
            currentStatus = 'FAILED';
            adminNote = liveResult.message || 'Clearance Failed';
            await prisma.serviceRequest.update({
                where: { id: request.id },
                data: { status: 'FAILED', adminNote: adminNote }
            });
        }
        // If PROCESSING, do nothing.
    }

    return NextResponse.json({
        status: true,
        current_status: currentStatus,
        message: currentStatus === 'COMPLETED' ? "Clearance Successful" : "Request in progress",
        data: responseData,
        reason: currentStatus === 'FAILED' ? adminNote : null,
        last_updated: new Date()
    });

  } catch (error) {
    console.error("IPE Status Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
