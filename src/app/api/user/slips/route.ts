import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // Fetch all requests where the serviceType includes "SLIP"
    const slips = await prisma.serviceRequest.findMany({
      where: {
        userId: user.id,
        serviceType: {
          contains: 'SLIP'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ status: true, data: slips });

  } catch (error) {
    console.error("Fetch Slips Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
