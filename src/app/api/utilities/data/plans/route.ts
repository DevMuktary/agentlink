import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.dataPlan.findMany({
        where: { isActive: true },
        orderBy: [
            { network: 'asc' },
            { price: 'asc' }
        ]
    });

    return NextResponse.json({ status: true, data: plans });
  } catch (error) {
    return NextResponse.json({ status: false, error: 'Failed to fetch plans' }, { status: 500 });
  }
}
