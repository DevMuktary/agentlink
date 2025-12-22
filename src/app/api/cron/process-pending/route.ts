import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// FIX: Update Import for IPE
import { checkIpeStatus } from '@/services/providers/ninslip-ipe'; 
import { checkPersonalizationStatus } from '@/services/providers/robost-personalization';

const CRON_SECRET = process.env.CRON_JOB_SECRET || 'my-secret-cron-key';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch Processing Requests
  const pendingRequests = await prisma.serviceRequest.findMany({
    where: { 
      status: 'PROCESSING',
      serviceType: { in: ['IPE_CLEARANCE', 'NIN_PERSONALIZATION'] }
    },
    take: 20 
  });

  let processed = 0;

  for (const req of pendingRequests) {
    const trackingId = (req.requestData as any)?.trackingId;
    if (!trackingId) continue;

    let result: any = null;

    // 1. Check IPE (Using NinSlip)
    if (req.serviceType === 'IPE_CLEARANCE') {
      result = await checkIpeStatus(trackingId);
    }
    // 2. Check Personalization (Using Robost)
    else if (req.serviceType === 'NIN_PERSONALIZATION') {
      result = await checkPersonalizationStatus(trackingId);
    }

    // 3. Update DB if status changed (COMPLETED or FAILED)
    if (result && result.success && result.status !== 'PROCESSING') {
      await prisma.serviceRequest.update({
        where: { id: req.id },
        data: {
          status: result.status,
          responseData: result.data || { message: result.message },
          adminNote: result.status === 'FAILED' ? 'Provider marked as Failed. No Refund.' : null
        }
      });
      processed++;
    }
  }

  return NextResponse.json({ 
    message: 'Cron executed', 
    checked: pendingRequests.length, 
    updated: processed 
  });
}
