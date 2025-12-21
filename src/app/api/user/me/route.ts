import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Verify Token
    const secret = process.env.JWT_SECRET || 'default-secret-key-change-me';
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 3. Fetch Real User Data (Balance, Name, etc.)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        firstName: true,
        lastName: true,
        businessName: true,
        walletBalance: true,
        email: true,
        apiKeyPublic: true,
        // We calculate total transactions count
        _count: {
          select: { requests: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('User Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
