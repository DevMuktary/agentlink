import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/zeptomail';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phoneNumber, businessName } = body;

    // 1. Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Check Exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // 3. Create User (EXPLICITLY INACTIVE)
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
        isActive: false, // <--- Force Pending State
      },
    });

    // 4. Send Notifications (Non-blocking)
    const fullName = `${firstName} ${lastName}`;
    
    // A. Notify User (Registration Received)
    await sendEmail({
        to: email,
        name: fullName,
        subject: 'Registration Received - AgentHub',
        html: emailTemplates.registrationReceived(fullName)
    });

    // B. Notify Admin (New User Alert)
    if (process.env.ADMIN_EMAIL) {
        await sendEmail({
            to: process.env.ADMIN_EMAIL,
            name: 'Administrator',
            subject: 'New User Registration Alert',
            html: emailTemplates.adminNewUserAlert(fullName, email)
        });
    }

    return NextResponse.json({ 
      message: 'Registration successful. Account under review.', 
      user: { id: user.id, email: user.email } 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
