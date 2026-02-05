import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'Server Misconfiguration' }, { status: 500 });
    }

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    
    // 2. Validate Credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. CHECK STATUS (New Enforcement)
    if (!user.isActive) {
      return NextResponse.json({ 
        error: 'Account is under review. Please check your email for updates.' 
      }, { status: 403 });
    }

    // 4. Generate Token
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' } // Expires in 1 day
    );

    // 5. Set Cookie
    const response = NextResponse.json({ message: 'Login successful', role: user.role });
    response.cookies.set('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
