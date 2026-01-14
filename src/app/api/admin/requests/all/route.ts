import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Admin Security Check
    const user = await validateApiKey(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ status: false, error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch Pending Requests
    const requests = await prisma.serviceRequest.findMany({
        where: {
            status: 'PROCESSING'
        },
        orderBy: {
            createdAt: 'desc' // Newest first
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

    return NextResponse.json(requests);

  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
