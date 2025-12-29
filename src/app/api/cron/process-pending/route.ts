import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkIpeStatus } from '@/services/providers/ninslip-ipe';

// This route should be called every 10-30 minutes by a Cron Service (like Vercel Cron or EasyCron)
export async function GET(req: Request) {
  try {
    // 1. Find all 'PROCESSING' IPE requests
    const pendingRequests = await prisma.serviceRequest.findMany({
      where: { 
        serviceType: 'IPE_CLEARANCE',
        status: 'PROCESSING'
      },
      take: 20 // Process in batches to avoid timeout
    });

    if (pendingRequests.length === 0) {
      return NextResponse.json({ message: 'No pending requests' });
    }

    const results = [];

    // 2. Loop through each request and check status
    for (const req of pendingRequests) {
      const trackingId = (req.requestData as any)?.trackingId;
      
      if (!trackingId) continue;

      // Call Provider
      const statusResult = await checkIpeStatus(trackingId);

      if (statusResult.status === 'COMPLETED') {
        // SUCCESS: Save the NEW Tracking ID (and other data) to responseData
        await prisma.serviceRequest.update({
          where: { id: req.id },
          data: { 
            status: 'COMPLETED',
            responseData: statusResult.data // This contains the New Tracking ID from Provider
          }
        });
        results.push({ id: req.id, status: 'COMPLETED' });

      } else if (statusResult.status === 'FAILED') {
        // FAILED: Mark as failed, NO REFUND (Money consumed by attempt)
        await prisma.serviceRequest.update({
          where: { id: req.id },
          data: { 
            status: 'FAILED',
            responseData: { 
              error: statusResult.message,
              reason: 'Clearance rejected by provider' 
            }
          }
        });
        results.push({ id: req.id, status: 'FAILED' });
      } 
      // If 'PROCESSING', do nothing, wait for next cron run
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length, 
      details: results 
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
