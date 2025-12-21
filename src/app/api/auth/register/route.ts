import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      businessName, 
      phoneNumber, 
      email, 
      password, 
      websiteUrl 
    } = body;

    // 1. Basic Validation
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' }, 
        { status: 400 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Generate API Keys
    const apiKeyPublic = 'pk_live_' + crypto.randomBytes(12).toString('hex');
    const apiKeySecret = 'sk_live_' + crypto.randomBytes(24).toString('hex');

    // 5. Create User
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        businessName,
        phoneNumber,
        email,
        websiteUrl,
        password: hashedPassword,
        apiKeyPublic,
        apiKeySecret,
        role: 'AGENT',
      },
    });

    return NextResponse.json({ 
      message: 'Account created successfully', 
      userId: user.id 
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
