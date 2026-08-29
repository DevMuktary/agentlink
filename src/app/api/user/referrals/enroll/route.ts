import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { getUniqueReferralCode } from '@/services/referral.service';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { bankCode, bankName, accountNumber, accountName } = await req.json();

    if (!bankCode || !bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        { status: false, error: 'Please provide complete verified bank details.' },
        { status: 400 }
      );
    }

    // Ensure user has a referral code
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = await getUniqueReferralCode();
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isReferralEnrolled: true,
        referralBankCode: bankCode,
        referralBankName: bankName,
        referralAccountNumber: accountNumber,
        referralAccountName: accountName,
        referralCode: referralCode,
      },
      select: {
        id: true,
        referralCode: true,
        isReferralEnrolled: true,
        referralBankName: true,
        referralAccountNumber: true,
        referralAccountName: true,
        referralEarningsBalance: true,
        referralEarningsTotal: true,
      },
    });

    return NextResponse.json({
      status: true,
      message: 'Successfully enrolled in Refer & Earn program!',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error in referral enrollment:', error);
    return NextResponse.json({ status: false, error: 'Failed to enroll in referral program.' }, { status: 500 });
  }
}
