import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { ServiceType } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ status: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const service = searchParams.get('service'); 
    const status = searchParams.get('status'); 

    const query: any = {};

    if (service) {
        query.serviceType = service as ServiceType;
    }

    // FIX: If status is 'ALL', don't filter. If missing, default to PROCESSING.
    if (status === 'ALL') {
        // No status filter = Fetch everything
    } else if (status) {
        query.status = status;
    } else {
        query.status = 'PROCESSING'; // Default behavior
    }

    const requests = await prisma.serviceRequest.findMany({
        where: query,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    businessName: true,
                    phoneNumber: true
                }
            }
        }
    });

    return NextResponse.json({
        status: true,
        data: requests
    });

  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
