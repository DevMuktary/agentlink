import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { ServiceType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // FIX: Dynamically find all service types that contain 'SLIP'
    // since Prisma doesn't allow 'contains' directly on Enums
    const slipServiceTypes = Object.values(ServiceType).filter(type => type.includes('SLIP'));

    // Fetch all requests where the serviceType is in the array of slip types
    const slips = await prisma.serviceRequest.findMany({
      where: {
        userId: user.id,
        serviceType: {
          in: slipServiceTypes
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
