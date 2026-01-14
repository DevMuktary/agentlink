import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  const admin = await validateApiKey(req);
  if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 1. Fetch Transactions with User Details
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500, // Limit for admin view
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true, businessName: true }
      }
    }
  });

  // 2. Calculate Totals (All time)
  const stats = await prisma.transaction.groupBy({
    by: ['type'],
    _sum: { amount: true }
  });

  return NextResponse.json({
    data: transactions,
    stats: stats.reduce((acc: any, curr) => {
      acc[curr.type] = curr._sum.amount;
      return acc;
    }, {})
  });
}
