import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    // Strict Admin Check
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Total Users
    const totalUsers = await prisma.user.count({
        where: { role: 'USER' }
    });

    // 2. Wallet Liability (Sum of all user balances)
    const walletSum = await prisma.user.aggregate({
        _sum: { walletBalance: true },
        where: { role: 'USER' }
    });

    // 3. Pending Requests (Total)
    const pendingRequests = await prisma.serviceRequest.count({
        where: { status: 'PROCESSING' }
    });

    // 4. Queue Breakdowns (Counts per service type)
    // We can group by serviceType, but for simplicity let's count key categories
    const cacCount = await prisma.serviceRequest.count({ where: { status: 'PROCESSING', serviceType: 'CAC_REGISTRATION' }});
    const taxCount = await prisma.serviceRequest.count({ where: { status: 'PROCESSING', serviceType: 'TAX_ID_GENERATION' }});
    const bvnEnrollCount = await prisma.serviceRequest.count({ where: { status: 'PROCESSING', serviceType: 'ANDROID_BVN_ENROLLMENT' }});
    const ninModCount = await prisma.serviceRequest.count({ where: { status: 'PROCESSING', serviceType: { in: ['NIN_MODIFICATION_NAME', 'NIN_MODIFICATION_PHONE', 'NIN_MODIFICATION_ADDRESS'] } }});
    const jambCount = await prisma.serviceRequest.count({ where: { status: 'PROCESSING', serviceType: { contains: 'JAMB' } }});

    // 5. Total Revenue (Sum of COMPLETED transactions)
    // Assuming 'cost' in ServiceRequest tracks revenue
    const revenueSum = await prisma.serviceRequest.aggregate({
        _sum: { cost: true },
        where: { status: 'COMPLETED' }
    });

    return NextResponse.json({
        status: true,
        data: {
            totalUsers,
            walletLiability: walletSum._sum.walletBalance || 0,
            pendingRequests,
            totalRevenue: revenueSum._sum.cost || 0,
            queues: {
                cac: cacCount,
                tax: taxCount,
                bvn_enrollment: bvnEnrollCount,
                nin_modification: ninModCount,
                jamb: jambCount
            }
        }
    });

  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
