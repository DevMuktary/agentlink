import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';

// Initialize Redis from Railway environment variable
const redis = new Redis(process.env.REDIS_URL || '');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 900; // 15 minutes

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'Server Misconfiguration' }, { status: 500 });
    }

    // Rate Limiting Setup: Tie attempts to both IP and Email to prevent targeted & distributed attacks
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    const rateLimitKey = `ratelimit:login:${email}:${ip}`;

    // Check if currently locked out
    const failedAttempts = await redis.get(rateLimitKey);
    if (failedAttempts && parseInt(failedAttempts) >= MAX_FAILED_ATTEMPTS) {
      const ttl = await redis.ttl(rateLimitKey);
      const minutesLeft = Math.ceil(ttl / 60);
      return NextResponse.json({ 
        error: `Too many failed login attempts. Please try again in ${minutesLeft} minutes.` 
      }, { status: 429 });
    }

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    
    // 2. Validate Credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Record failed attempt in Redis
      const currentAttempts = await redis.incr(rateLimitKey);
      // Ensure the key expires after 15 mins, even on the first failed attempt
      if (currentAttempts === 1) {
        await redis.expire(rateLimitKey, LOCKOUT_DURATION_SECONDS);
      }

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Clear failed attempts on successful credential validation
    await redis.del(rateLimitKey);

    // 4. CHECK STATUS
    // Since users are active by default now, if isActive is false, it means an Admin explicitly suspended them.
    if (!user.isActive) {
      return NextResponse.json({ 
        error: 'Your account has been deactivated or suspended. Please contact support.' 
      }, { status: 403 });
    }

    // 5. Generate Token
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' } // Expires in 1 day
    );

    // 6. Set Cookie
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
