import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp,
      }
    });

    if (!record) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > record.expires) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Valid! Delete the token so it can't be used again
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    return NextResponse.json({ success: true, message: 'Email Verified' });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
