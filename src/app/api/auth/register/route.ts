import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/zeptomail';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phoneNumber, businessName } = body;

    // 1. Basic Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Check Exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // 3. Create User (Default status: PENDING or ACTIVE depending on your flow)
    // NOTE: Usually you want them PENDING first if admin reviews.
    // If your schema has a 'status' field, set it to 'PENDING'. 
    // If not, we assume they are active but we just email them.
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        businessName,
        role: 'AGENT', // Default role
        // status: 'PENDING' // <--- Uncomment if you added a status field to User schema
      },
    });

    // 4. SEND EMAILS (Non-blocking)
    const fullName = `${firstName} ${lastName}`;
    
    // Email A: To User
    await sendEmail({
        to: email,
        name: fullName,
        subject: 'Registration Received - AgentHub',
        html: emailTemplates.registrationReceived(fullName)
    });

    // Email B: To Admin
    if (process.env.ADMIN_EMAIL) {
        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            name: 'Administrator',
            subject: 'New User Alert',
            html: emailTemplates.adminNewUserAlert(fullName, email)
        });
    }

    return NextResponse.json({ message: 'User created successfully', user: { id: user.id, email: user.email } }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
