import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/zeptomail';
import { Redis } from 'ioredis';

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || '');

const MAX_ACCOUNTS_PER_IP = 2;
const IP_LOCKOUT_SECONDS = 7 * 24 * 60 * 60; // 7 Days in seconds

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phoneNumber, businessName } = body;

    // 1. Basic Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. IP Rate Limiting & Abuse Protection
    // Note: In Next.js App Router deployed on platforms like Vercel/Railway, 
    // x-forwarded-for gets the true client IP.
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    const rateLimitKey = `ratelimit:register:${ip}`;
    
    const accountsCreated = await redis.get(rateLimitKey);
    if (accountsCreated && parseInt(accountsCreated) >= MAX_ACCOUNTS_PER_IP) {
      return NextResponse.json({ 
        error: 'Registration limit reached. You can only create 2 accounts per week from this network.' 
      }, { status: 429 });
    }

    // 3. Check Exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // 4. Create User (Active by Default, API Access is 'NONE')
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        businessName,
        role: 'AGENT',
        isActive: true,    // Immediate dashboard access
        apiStatus: 'NONE'  // No API access by default
      },
    });

    // 5. Update Redis IP Count
    const currentCount = await redis.incr(rateLimitKey);
    if (currentCount === 1) {
       // Only set the 7-day expiration on the very first registration
       await redis.expire(rateLimitKey, IP_LOCKOUT_SECONDS);
    }

    // 6. Send Welcome Email (Non-blocking)
    const fullName = `${firstName} ${lastName}`;
    
    // Notify User
    await sendEmail({
        to: email,
        name: fullName,
        subject: 'Welcome to AgentHub',
        html: emailTemplates.welcomeEmail(fullName)
    });
    
    // Note: Admin notification removed as requested.

    return NextResponse.json({ 
      message: 'Registration successful. Welcome to AgentHub!', 
      user: { id: user.id, email: user.email } 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
