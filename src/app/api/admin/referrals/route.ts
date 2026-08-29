import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = await validateApiKey(req);
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Fetch Global Settings
    const [minPayoutSetting, activeSetting] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'MIN_REFERRAL_PAYOUT' } }),
      prisma.systemSetting.findUnique({ where: { key: 'IS_REFERRAL_ACTIVE' } }),
    ]);

    const minPayout = minPayoutSetting ? Number(minPayoutSetting.value) : 3000;
    const isReferralActive = activeSetting ? activeSetting.value === 'true' : true;

    // 2. Fetch Global Stats
    const [enrolledCount, totalRefereesCount, commissionsSum, pendingPayouts] = await Promise.all([
      prisma.user.count({ where: { isReferralEnrolled: true } }),
      prisma.user.count({ where: { referredById: { not: null } } }),
      prisma.referralEarning.aggregate({
        _sum: { amount: true },
      }),
      prisma.payoutRequest.findMany({
        where: { status: 'PENDING', type: 'BANK' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalCommissions = Number(commissionsSum._sum.amount || 0);
    const pendingPayoutsAmount = pendingPayouts.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // 3. Fetch All Payout Requests (Recent 100)
    const allPayouts = await prisma.payoutRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // 4. Fetch Enrolled Referrers Directory
    const referrers = await prisma.user.findMany({
      where: { isReferralEnrolled: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        businessName: true,
        referralCode: true,
        referralBankName: true,
        referralAccountNumber: true,
        referralAccountName: true,
        referralEarningsBalance: true,
        referralEarningsTotal: true,
        createdAt: true,
        _count: {
          select: {
            referrals: true,
          },
        },
      },
      orderBy: { referralEarningsTotal: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      status: true,
      data: {
        stats: {
          enrolledReferrers: enrolledCount,
          totalReferees: totalRefereesCount,
          totalCommissionsPaid: totalCommissions,
          pendingPayoutsCount: pendingPayouts.length,
          pendingPayoutsAmount: pendingPayoutsAmount,
          minPayoutThreshold: minPayout,
          isReferralActive,
        },
        pendingPayouts: pendingPayouts.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          type: p.type,
          status: p.status,
          bankName: p.bankName,
          accountNumber: p.accountNumber,
          accountName: p.accountName,
          reference: p.reference,
          createdAt: p.createdAt,
          user: {
            id: p.user.id,
            name: `${p.user.firstName} ${p.user.lastName}`,
            email: p.user.email,
            phone: p.user.phoneNumber,
          },
        })),
        allPayouts: allPayouts.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          type: p.type,
          status: p.status,
          bankName: p.bankName,
          accountNumber: p.accountNumber,
          accountName: p.accountName,
          adminNote: p.adminNote,
          reference: p.reference,
          createdAt: p.createdAt,
          processedAt: p.processedAt,
          user: {
            id: p.user.id,
            name: `${p.user.firstName} ${p.user.lastName}`,
            email: p.user.email,
            phone: p.user.phoneNumber,
          },
        })),
        referrers: referrers.map((r) => ({
          id: r.id,
          name: `${r.firstName} ${r.lastName}`,
          email: r.email,
          phone: r.phoneNumber,
          businessName: r.businessName,
          referralCode: r.referralCode,
          bankName: r.referralBankName,
          accountNumber: r.referralAccountNumber,
          accountName: r.referralAccountName,
          balance: Number(r.referralEarningsBalance),
          totalEarned: Number(r.referralEarningsTotal),
          refereesCount: r._count.referrals,
          joinedAt: r.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error in Admin referrals route:', error);
    return NextResponse.json({ status: false, error: 'Server error loading admin referral data' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await validateApiKey(req);
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { minPayout, isReferralActive } = await req.json();

    if (minPayout !== undefined) {
      const minVal = Number(minPayout);
      if (isNaN(minVal) || minVal < 100) {
        return NextResponse.json({ status: false, error: 'Minimum payout threshold must be at least ₦100.' }, { status: 400 });
      }

      await prisma.systemSetting.upsert({
        where: { key: 'MIN_REFERRAL_PAYOUT' },
        update: { value: String(minVal) },
        create: {
          key: 'MIN_REFERRAL_PAYOUT',
          value: String(minVal),
          description: 'Minimum bank withdrawal threshold for referral earnings',
        },
      });
    }

    if (isReferralActive !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'IS_REFERRAL_ACTIVE' },
        update: { value: String(isReferralActive) },
        create: {
          key: 'IS_REFERRAL_ACTIVE',
          value: String(isReferralActive),
          description: 'Global master switch for referral commission distribution',
        },
      });
    }

    return NextResponse.json({ status: true, message: 'Referral settings updated successfully.' });
  } catch (error) {
    console.error('Error updating admin referral settings:', error);
    return NextResponse.json({ status: false, error: 'Server error updating settings' }, { status: 500 });
  }
}
