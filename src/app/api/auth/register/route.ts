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

    // 3. Create User (Active by Default, API Access is 'NONE')
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
        isActive: true, // Immediate dashboard access
        apiStatus: 'NONE' // API keys disabled by default
      },
    });

    // 4. Send Notifications (Non-blocking)
    const fullName = `${firstName} ${lastName}`;
    
    // A. Notify User (Welcome Email)
    // Assuming you have or will create a welcome email template in zeptomail.ts
    await sendEmail({
        to: email,
        name: fullName,
        subject: 'Welcome to AgentLink',
        html: emailTemplates.registrationReceived(fullName) // Swap this to a Welcome Template later
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

    // Return immediate success
    return NextResponse.json({ 
      message: 'Registration successful. Welcome to the platform.', 
      user: { id: user.id, email: user.email } 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
