import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { ServiceType } from '@prisma/client';

export async function GET(req: Request) {
  try {
    // 1. Admin Security Check
    const user = await validateApiKey(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ status: false, error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse Query Params
    const { searchParams } = new URL(req.url);
    const service = searchParams.get('service'); // e.g. "CAC_REGISTRATION"
    const status = searchParams.get('status');   // Optional: "PROCESSING", "COMPLETED"

    // 3. Build Query Object
    const query: any = {};

    // Filter by Service Type if provided
    if (service) {
        query.serviceType = service as ServiceType;
    }

    // Filter by Status (Default to PROCESSING if not specified)
    if (status) {
        query.status = status;
    } else {
        query.status = 'PROCESSING';
    }

    // 4. Fetch Requests
    const requests = await prisma.serviceRequest.findMany({
        where: query,
        orderBy: {
            createdAt: 'desc' // Newest first
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

    // 5. Standardized Response
    return NextResponse.json({
        status: true,
        data: requests
    });

  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
