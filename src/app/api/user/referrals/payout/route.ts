import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { type, amount } = await req.json();
    const payoutAmount = Number(amount);

    if (!type || !['WALLET', 'BANK'].includes(type)) {
      return NextResponse.json({ status: false, error: 'Invalid payout type. Choose WALLET or BANK.' }, { status: 400 });
    }

    if (!payoutAmount || isNaN(payoutAmount) || payoutAmount <= 0) {
      return NextResponse.json({ status: false, error: 'Please enter a valid payout amount.' }, { status: 400 });
    }

    // 1. Fetch fresh user data with lock check
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isReferralEnrolled: true,
        referralEarningsBalance: true,
        referralBankName: true,
        referralAccountNumber: true,
        referralAccountName: true,
      },
    });

    if (!freshUser) {
      return NextResponse.json({ status: false, error: 'User not found' }, { status: 404 });
    }

    if (!freshUser.isReferralEnrolled) {
      return NextResponse.json({ status: false, error: 'You are not enrolled in the referral program.' }, { status: 400 });
    }

    const availableBalance = Number(freshUser.referralEarningsBalance || 0);
    if (availableBalance < payoutAmount) {
      return NextResponse.json(
        { status: false, error: `Insufficient referral earnings balance. Available: ₦${availableBalance.toLocaleString()}` },
        { status: 400 }
      );
    }

    // 2. Validate thresholds based on payout type
    if (type === 'WALLET') {
      if (payoutAmount < 100) {
        return NextResponse.json({ status: false, error: 'Minimum transfer to wallet is ₦100.' }, { status: 400 });
      }

      const reference = `PAYOUT-WAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Execute Instant Transfer to Main Wallet
      await prisma.$transaction(async (tx) => {
        // Deduct from referral balance and add to main wallet
        await tx.user.update({
          where: { id: freshUser.id },
          data: {
            referralEarningsBalance: { decrement: payoutAmount },
            walletBalance: { increment: payoutAmount },
          },
        });

        // Record Completed Payout Request
        await tx.payoutRequest.create({
          data: {
            userId: freshUser.id,
            amount: payoutAmount,
            type: 'WALLET',
            status: 'COMPLETED',
            reference: reference,
            adminNote: 'Instant transfer to Main Wallet',
            processedAt: new Date(),
          },
        });

        // Record Transaction in Ledger
        await tx.transaction.create({
          data: {
            userId: freshUser.id,
            amount: payoutAmount,
            type: 'BONUS',
            status: 'COMPLETED',
            reference: reference,
            description: `Referral Bonus Transfer to Main Wallet`,
          },
        });
      });

      return NextResponse.json({
        status: true,
        message: `₦${payoutAmount.toLocaleString()} transferred to your main wallet balance instantly!`,
      });
    }

    // Bank Payout Flow
    if (type === 'BANK') {
      if (!freshUser.referralAccountNumber || !freshUser.referralBankName || !freshUser.referralAccountName) {
        return NextResponse.json(
          { status: false, error: 'Please update your verified bank account details first.' },
          { status: 400 }
        );
      }

      const minPayoutSetting = await prisma.systemSetting.findUnique({
        where: { key: 'MIN_REFERRAL_PAYOUT' },
      });
      const minPayout = minPayoutSetting ? Number(minPayoutSetting.value) : 3000;

      if (payoutAmount < minPayout) {
        return NextResponse.json(
          { status: false, error: `Minimum bank withdrawal amount is ₦${minPayout.toLocaleString()}.` },
          { status: 400 }
        );
      }

      const reference = `PAYOUT-BNK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Deduct from available referral balance and create PENDING payout request
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: freshUser.id },
          data: {
            referralEarningsBalance: { decrement: payoutAmount },
          },
        });

        await tx.payoutRequest.create({
          data: {
            userId: freshUser.id,
            amount: payoutAmount,
            type: 'BANK',
            status: 'PENDING',
            reference: reference,
            bankName: freshUser.referralBankName,
            accountNumber: freshUser.referralAccountNumber,
            accountName: freshUser.referralAccountName,
          },
        });
      });

      return NextResponse.json({
        status: true,
        message: `Withdrawal request for ₦${payoutAmount.toLocaleString()} submitted successfully. Payout will be processed shortly.`,
      });
    }

    return NextResponse.json({ status: false, error: 'Invalid payout request.' }, { status: 400 });
  } catch (error) {
    console.error('Error processing payout request:', error);
    return NextResponse.json({ status: false, error: 'Server error processing payout request.' }, { status: 500 });
  }
}
