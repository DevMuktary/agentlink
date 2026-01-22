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

    // 1. Total Users (Using 'AGENT' as the standard user role)
    const totalUsers = await prisma.user.count({
        where: { role: 'AGENT' }
    });

    // 2. Wallet Liability (Sum of all AGENT balances)
    const walletSum = await prisma.user.aggregate({
        _sum: { walletBalance: true },
        where: { role: 'AGENT' }
    });

    // 3. Pending Requests (Total)
    const pendingRequests = await prisma.serviceRequest.count({
        where: { status: 'PROCESSING' }
    });

    // --- 4. Queue Breakdowns (Counts per service category) ---
    
    // A. Corporate
    const cacCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'CAC_REGISTRATION' }
    });
    const taxCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: { in: ['TAX_ID_INDIVIDUAL', 'TAX_ID_NON_INDIVIDUAL'] } }
    });

    // B. Banking (BVN)
    const bvnEnrollCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'ANDROID_BVN_ENROLLMENT' }
    });
    const bvnModCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: { contains: 'BVN_MODIFICATION' } }
    });
    const bvnRetrievalCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'BVN_RETRIEVAL' }
    });
    const vninNibssCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'VNIN_TO_NIBSS' }
    });

    // C. Identity (NIN)
    const ninModCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: { contains: 'NIN_MODIFICATION' } }
    });
    const ninValidationCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'NIN_VALIDATION' }
    });

    // D. Education
    const jambCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: { contains: 'JAMB' } }
    });

    // 5. Total Revenue (Sum of COMPLETED transactions)
    const revenueSum = await prisma.serviceRequest.aggregate({
        _sum: { cost: true },
        where: { status: 'COMPLETED' }
    });

    return NextResponse.json({
        status: true,
        data: {
            totalUsers: totalUsers || 0,
            walletLiability: Number(walletSum._sum.walletBalance) || 0,
            pendingRequests: pendingRequests || 0,
            totalRevenue: Number(revenueSum._sum.cost) || 0,
            queues: {
                cac: cacCount,
                tax: taxCount,
                bvn_enrollment: bvnEnrollCount,
                bvn_modification: bvnModCount,
                bvn_retrieval: bvnRetrievalCount,
                vnin_nibss: vninNibssCount,
                nin_modification: ninModCount,
                nin_validation: ninValidationCount,
                jamb: jambCount
            }
        }
    });

  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
