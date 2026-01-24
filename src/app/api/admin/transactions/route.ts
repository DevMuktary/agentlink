import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Auth Check
    const user = await validateApiKey(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Fetch Transactions (Latest 1000)
    // In production, you would add real pagination (skip/take) here.
    const transactions = await prisma.transaction.findMany({
        take: 10000, 
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    businessName: true
                }
            }
        }
    });

    return NextResponse.json({
        status: true,
        data: transactions
    });

  } catch (error) {
    console.error("Tx Fetch Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
