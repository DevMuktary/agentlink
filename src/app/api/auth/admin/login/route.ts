import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-admin-key';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ status: false, error: 'Missing credentials' }, { status: 400 });
    }

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email } });

    // 2. Validate User & Password
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ status: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. STRICT ROLE CHECK (Security Barrier)
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        status: false, 
        error: 'Access Denied: You do not have administrative privileges.' 
      }, { status: 403 });
    }

    // 4. Generate Token
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '12h' } // Admin sessions last 12 hours
    );

    // 5. Return Success (Set Cookie via response header usually, or return token)
    // For this setup, we return the token and the frontend saves it.
    const response = NextResponse.json({
      status: true,
      message: 'Welcome back, Admin',
      token,
      user: {
        firstName: user.firstName,
        role: user.role
      }
    });

    // Set HTTP-Only Cookie for security
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 12, // 12 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
