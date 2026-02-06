import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/zeptomail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    // 1. Check if User Exists (Don't allow OTP if email taken)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered. Please login.' }, { status: 409 });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Save to DB (Delete old OTPs for this email first)
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: otp, expires }
    });

    // 4. Send Email
    await sendEmail({
      to: email,
      name: 'New User',
      subject: 'Verify your Email - AgentHub',
      html: emailTemplates.emailVerificationOtp(otp)
    });

    return NextResponse.json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
