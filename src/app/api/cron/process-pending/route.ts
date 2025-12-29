import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkIpeStatus } from '@/services/providers/ninslip-ipe';

export async function GET(req: Request) {
  try {
    // 1. SECURITY CHECK: Ensure only authorized system can call this
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Find all 'PROCESSING' IPE requests
    const pendingRequests = await prisma.serviceRequest.findMany({
      where: { 
        serviceType: 'IPE_CLEARANCE',
        status: 'PROCESSING'
      },
      take: 20 
    });

    if (pendingRequests.length === 0) {
      return NextResponse.json({ message: 'No pending requests' });
    }

    const results = [];

    // 3. Process each request
    for (const req of pendingRequests) {
      const trackingId = (req.requestData as any)?.trackingId;
      if (!trackingId) continue;

      const statusResult = await checkIpeStatus(trackingId);

      if (statusResult.status === 'COMPLETED') {
        await prisma.serviceRequest.update({
          where: { id: req.id },
          data: { status: 'COMPLETED', responseData: statusResult.data }
        });
        results.push({ id: req.id, status: 'COMPLETED' });
      } else if (statusResult.status === 'FAILED') {
        await prisma.serviceRequest.update({
          where: { id: req.id },
          data: { 
            status: 'FAILED',
            responseData: { error: statusResult.message, reason: 'Provider Rejected' }
          }
        });
        results.push({ id: req.id, status: 'FAILED' });
      } 
    }

    return NextResponse.json({ success: true, processed: results.length, details: results });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
