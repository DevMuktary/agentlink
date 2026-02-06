import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify OTP
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: otp }
    });

    if (!record) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    if (new Date() > record.expires) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // 2. Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update User Password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // 4. Cleanup (Delete used token)
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password Reset Confirm Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
