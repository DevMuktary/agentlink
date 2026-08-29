import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch fresh user referral state
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        referralCode: true,
        isReferralEnrolled: true,
        referralBankCode: true,
        referralBankName: true,
        referralAccountNumber: true,
        referralAccountName: true,
        referralEarningsBalance: true,
        referralEarningsTotal: true,
        walletBalance: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ status: false, error: 'User not found' }, { status: 404 });
    }

    // 2. Fetch Referred Users
    const referees = await prisma.user.findMany({
      where: { referredById: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        createdAt: true,
        _count: {
          select: {
            requests: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Fetch Commission History
    const earnings = await prisma.referralEarning.findMany({
      where: { referrerId: user.id },
      include: {
        referee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 4. Fetch Payout History
    const payouts = await prisma.payoutRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 5. Fetch Services Commission Breakdown (Matrix)
    const [services, dataPlans, minPayoutSetting] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        select: {
          id: true,
          code: true,
          name: true,
          referralReward: true,
          dashboardPrice: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.dataPlan.findMany({
        where: { isActive: true },
        select: {
          id: true,
          productCode: true,
          name: true,
          network: true,
          category: true,
          referralReward: true,
          dashboardPrice: true,
        },
        orderBy: [{ network: 'asc' }, { name: 'asc' }],
      }),
      prisma.systemSetting.findUnique({
        where: { key: 'MIN_REFERRAL_PAYOUT' },
      }),
    ]);

    const minPayout = minPayoutSetting ? Number(minPayoutSetting.value) : 3000;

    return NextResponse.json({
      status: true,
      data: {
        user: currentUser,
        referees: referees.map((r) => ({
          id: r.id,
          name: `${r.firstName} ${r.lastName}`,
          businessName: r.businessName,
          joinedAt: r.createdAt,
          completedServicesCount: r._count.requests,
        })),
        earnings: earnings.map((e) => ({
          id: e.id,
          refereeName: `${e.referee.firstName} ${e.referee.lastName}`,
          serviceType: e.serviceType,
          amount: Number(e.amount),
          reference: e.reference,
          status: e.status,
          createdAt: e.createdAt,
        })),
        payouts: payouts.map((p) => ({
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
        })),
        commissionMatrix: {
          services: services.map((s) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            reward: Number(s.referralReward || 0),
            price: Number(s.dashboardPrice || 0),
          })),
          dataPlans: dataPlans.map((d) => ({
            id: d.id,
            name: d.name,
            network: d.network,
            category: d.category,
            reward: Number(d.referralReward || 0),
            price: Number(d.dashboardPrice || 0),
          })),
        },
        minPayout,
      },
    });
  } catch (error) {
    console.error('Error fetching user referral dashboard data:', error);
    return NextResponse.json({ status: false, error: 'Server error loading referral data' }, { status: 500 });
  }
}
