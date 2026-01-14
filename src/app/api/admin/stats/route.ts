import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    // Strict Server-Side Check
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ status: false, error: 'Forbidden' }, { status: 403 });
    }

    // 1. Pending Requests Count
    const pendingRequests = await prisma.serviceRequest.count({
        where: { status: 'PROCESSING' }
    });

    // 2. Today's Successful Transactions
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const todaySales = await prisma.serviceRequest.aggregate({
        where: { 
            status: 'COMPLETED',
            createdAt: { gte: today }
        },
        _sum: { cost: true }
    });

    // 3. Total Users
    const totalUsers = await prisma.user.count();

    // 4. Wallet Balance (Total User Funds) - Important for liability
    const totalWallet = await prisma.user.aggregate({
        _sum: { walletBalance: true }
    });

    return NextResponse.json({
        pending_jobs: pendingRequests,
        users_count: totalUsers,
        today_revenue: todaySales._sum.cost || 0,
        total_user_wallets: totalWallet._sum.walletBalance || 0
    });

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
