import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/zeptomail';
import { Redis } from 'ioredis';

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || '');

const MAX_ACCOUNTS_PER_IP = 2;
const IP_LOCKOUT_SECONDS = 7 * 24 * 60 * 60; // 7 Days in seconds

// --- STRICT VALIDATION PATTERNS ---
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(?:\+234|0)[789][01]\d{8}$/; // Matches Nigerian phone formats (080..., +234...)
const nameRegex = /^[a-zA-Z\s\-']{2,50}$/; // Letters, spaces, hyphens, min 2 chars
const businessNameRegex = /^[a-zA-Z0-9\s\-&.,']{2,100}$/; // Alphanumeric + basic symbols

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phoneNumber, businessName } = body;

    // 1. Strict Data Validation
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }
    if (!firstName || !nameRegex.test(firstName)) {
      return NextResponse.json({ error: 'First name must contain only letters and be 2-50 characters' }, { status: 400 });
    }
    if (!lastName || !nameRegex.test(lastName)) {
      return NextResponse.json({ error: 'Last name must contain only letters and be 2-50 characters' }, { status: 400 });
    }
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format. Use standard Nigerian format' }, { status: 400 });
    }
    if (businessName && !businessNameRegex.test(businessName)) {
      return NextResponse.json({ error: 'Business name contains invalid characters' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // 2. IP Rate Limiting & Abuse Protection
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
        isActive: true,
        apiStatus: 'NONE'
      },
    });

    // 5. Update Redis IP Count
    const currentCount = await redis.incr(rateLimitKey);
    if (currentCount === 1) {
       await redis.expire(rateLimitKey, IP_LOCKOUT_SECONDS);
    }

    // 6. Send Welcome Email
    const fullName = `${firstName} ${lastName}`;
    await sendEmail({
        to: email,
        name: fullName,
        subject: 'Welcome to AgentHub',
        html: emailTemplates.welcomeEmail(fullName)
    });
    
    return NextResponse.json({ 
      message: 'Registration successful. Welcome to AgentHub!', 
      user: { id: user.id, email: user.email } 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
