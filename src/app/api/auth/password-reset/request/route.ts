import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/zeptomail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    // 1. Check if User Exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Security: We return success even if user doesn't exist to prevent email enumeration attacks
      return NextResponse.json({ message: 'If that email exists, we sent an OTP.' });
    }

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Save to DB (Reuse the VerificationToken model)
    // Delete any existing tokens for this email first
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: otp, expires }
    });

    // 4. Send Email
    await sendEmail({
      to: email,
      name: user.firstName,
      subject: 'Reset Your Password - AgentHub',
      html: emailTemplates.passwordResetOtp(otp)
    });

    return NextResponse.json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Password Reset Request Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
