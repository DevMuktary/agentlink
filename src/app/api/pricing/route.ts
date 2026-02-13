import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// CRITICAL: This forces Next.js to fetch fresh data every time
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    const dataPlans = await prisma.dataPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    return NextResponse.json({ 
        status: true, 
        data: { services, dataPlans } 
    });
  } catch (error) {
    return NextResponse.json({ status: false, error: 'Failed to load pricing' }, { status: 500 });
  }
}
