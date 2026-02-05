import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // Fetch users where isActive is false (Pending Approval)
    // Ordered by newest first
    const pendingUsers = await prisma.user.findMany({
      where: {
        isActive: false, 
        // Optional: If you have a 'role' check to avoid fetching admins
        role: { not: 'SUPER_ADMIN' } 
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        businessName: true,
        createdAt: true,
        role: true,
        walletBalance: true
      }
    });

    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error('Fetch Pending Users Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
