import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  const user = await validateApiKey(req);
  if (!user || user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return NextResponse.json({}, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, firstName: true, lastName: true, email: true, walletBalance: true, role: true, businessName: true, createdAt: true }
  });
  return NextResponse.json(users);
}
