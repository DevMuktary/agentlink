import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Generate API Keys (pk_live_... and sk_live_...)
    const apiKeyPublic = 'pk_live_' + crypto.randomBytes(12).toString('hex');
    const apiKeySecret = 'sk_live_' + crypto.randomBytes(24).toString('hex');

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        apiKeyPublic,
        apiKeySecret,
        role: 'AGENT',
      },
    });

    return NextResponse.json({ message: 'Account created successfully', userId: user.id });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
