import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Public endpoint to fetch plans
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const network = searchParams.get('network'); // e.g. MTN, GLO
    
    const whereClause: any = {
        isActive: true
    };

    if (network) {
        whereClause.network = network.toUpperCase();
    }

    const plans = await prisma.dataPlan.findMany({
        where: whereClause,
        orderBy: [
            { network: 'asc' },
            { price: 'asc' }
        ],
        select: {
            productCode: true,
            name: true,
            network: true,
            category: true,
            price: true,
            validity: true
        }
    });

    return NextResponse.json({
        status: true,
        count: plans.length,
        data: plans
    });

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
