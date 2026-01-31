import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Revalidate every hour to keep prices fresh without hitting DB on every reload
export const revalidate = 3600; 

export async function GET() {
  try {
    const [services, dataPlans] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }),
      prisma.dataPlan.findMany({
        where: { isActive: true },
        orderBy: [
            { network: 'asc' },
            { price: 'asc' }
        ]
      })
    ]);

    return NextResponse.json({
      status: true,
      data: {
        services,
        dataPlans
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, error: 'Failed to fetch pricing' }, { status: 500 });
  }
}
