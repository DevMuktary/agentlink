import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
            isActive: true,
            walletBalance: true,
            createdAt: true,
            _count: {
                select: { serviceRequests: true } // See how active they are
            }
        }
    });

    return NextResponse.json({ status: true, data: users });
  } catch (error) {
    return NextResponse.json({ status: false, error: 'Error fetching users' }, { status: 500 });
  }
}
