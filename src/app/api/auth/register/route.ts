import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phoneNumber, businessName } = body;

    // 1. Basic Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Check if User Already Exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // 3. Hash Password (Salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    // Note: We do NOT include 'role' here, so it defaults to 'AGENT' as defined in your schema.
    // This prevents anyone from forcing themselves to be an ADMIN.
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,   // Optional based on your schema
        businessName,  // Optional based on your schema
      },
    });

    // 5. Return Success (exclude password from response)
    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          role: user.role
        } 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
