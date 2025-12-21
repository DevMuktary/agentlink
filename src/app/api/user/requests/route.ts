import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key-change-me');
    
    // Get 'type' query param (e.g., ?type=NIN_VERIFICATION)
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const requests = await prisma.serviceRequest.findMany({
      where: { 
        userId: decoded.userId,
        ...(type && { serviceType: type as any }) // Filter if type provided
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching requests' }, { status: 500 });
  }
}
