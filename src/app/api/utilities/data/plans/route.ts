import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ⚠️ FORCE DYNAMIC: This ensures the API always fetches fresh data from the DB
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await prisma.dataPlan.findMany({
        where: { isActive: true },
        orderBy: [
            { network: 'asc' }, // Group by Network
            { price: 'asc' }    // Sort by Price
        ]
    });

    return NextResponse.json({ status: true, data: plans });
  } catch (error) {
    return NextResponse.json({ status: false, error: 'Failed to fetch plans' }, { status: 500 });
  }
}
