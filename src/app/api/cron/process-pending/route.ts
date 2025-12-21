import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkIpeStatus } from '@/services/providers/robost-ipe';
import { checkPersonalizationStatus } from '@/services/providers/robost-personalization';

// Secure this route so only Railway/You can call it
const CRON_SECRET = process.env.CRON_JOB_SECRET || 'my-secret-cron-key';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch Processing Requests (Limit 20 to prevent timeouts)
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

    // 1. Check IPE
    if (req.serviceType === 'IPE_CLEARANCE') {
      result = await checkIpeStatus(trackingId);
    }
    // 2. Check Personalization
    else if (req.serviceType === 'NIN_PERSONALIZATION') {
      result = await checkPersonalizationStatus(trackingId);
    }

    // 3. Update Database if status changed
    if (result && result.success && result.status !== 'PROCESSING') {
      
      await prisma.serviceRequest.update({
        where: { id: req.id },
        data: {
          status: result.status, // COMPLETED or FAILED
          responseData: result.data || { message: result.message },
          adminNote: result.status === 'FAILED' ? 'Provider marked as Failed. No Refund.' : null
        }
      });
      processed++;
    }
  }

  return NextResponse.json({ 
    message: 'Cron executed successfully', 
    checked: pendingRequests.length, 
    updated: processed 
  });
}
