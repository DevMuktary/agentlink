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
            // Assuming you added isActive back to schema, or removed it from here if you are using Role-based blocking
            // For now, I will keep it but if it fails again remove 'isActive: true'
            isActive: true, 
            walletBalance: true,
            createdAt: true,
            _count: {
                select: { requests: true } // CHANGED from serviceRequests to requests
            }
        }
    });

    // Map response to handle missing isActive if necessary
    const safeUsers = users.map(u => ({
        ...u,
        isActive: (u as any).isActive ?? true // Default to true if field missing
    }));

    return NextResponse.json({ status: true, data: safeUsers });
  } catch (error) {
    return NextResponse.json({ status: false, error: 'Error fetching users' }, { status: 500 });
  }
}
