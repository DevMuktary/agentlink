import prisma from '@/lib/prisma';
import { ServiceType } from '@prisma/client';

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AG';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getUniqueReferralCode(): Promise<string> {
  let unique = false;
  let code = '';
  let attempts = 0;
  while (!unique && attempts < 10) {
    code = generateReferralCode();
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) {
      unique = true;
    }
    attempts++;
  }
  return code;
}

interface DistributeCommissionParams {
  refereeId: string;
  serviceType: ServiceType;
  dataPlanId?: string;
  serviceRequestId?: string;
  reference: string;
  origin?: string | null;
}

export async function distributeReferralCommission({
  refereeId,
  serviceType,
  dataPlanId,
  serviceRequestId,
  reference,
  origin,
}: DistributeCommissionParams): Promise<{ success: boolean; rewardedAmount?: number; reason?: string }> {
  try {
    console.log(`[ReferralEngine] Triggered for Referee: ${refereeId}, Service: ${serviceType}, Reference: ${reference}, Origin: ${origin || 'dashboard'}`);

    // 1. STRICT CHANNEL GUARD: Dashboard only, no API requests!
    if (origin === 'api') {
      console.log(`[ReferralEngine] Skipped: Request origin is external API.`);
      return { success: false, reason: 'Commissions not awarded for API transactions.' };
    }

    // 2. Check if global referral system is enabled
    const activeSetting = await prisma.systemSetting.findUnique({
      where: { key: 'IS_REFERRAL_ACTIVE' },
    });
    if (activeSetting && activeSetting.value === 'false') {
      console.log(`[ReferralEngine] Skipped: Global referral switch IS_REFERRAL_ACTIVE is false.`);
      return { success: false, reason: 'Referral program is currently inactive.' };
    }

    // Exempt Airtime and Data completely from commissions
    const serviceTypeStr = String(serviceType || '');
    if (serviceTypeStr === 'DATA' || serviceTypeStr === 'AIRTIME' || serviceTypeStr.startsWith('AIRTIME_') || dataPlanId) {
      console.log(`[ReferralEngine] Skipped: Service ${serviceTypeStr} is exempt (Airtime/Data).`);
      return { success: false, reason: 'Airtime and Data services are exempt from referral commissions.' };
    }

    // 3. Find Referee & Referrer
    const referee = await prisma.user.findUnique({
      where: { id: refereeId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        referredById: true,
        createdAt: true,
        referrer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isActive: true,
            isReferralEnrolled: true,
          },
        },
      },
    });

    if (!referee || !referee.referredById || !referee.referrer) {
      console.log(`[ReferralEngine] Skipped: Referee ${refereeId} has no linked referrer.`);
      return { success: false, reason: 'User does not have an active referrer.' };
    }

    // 1-YEAR COMMISSION ELIGIBILITY CHECK
    const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;
    const refereeJoinedTime = new Date(referee.createdAt).getTime();
    if (Date.now() - refereeJoinedTime > ONE_YEAR_IN_MS) {
      console.log(`[ReferralEngine] Skipped: 1-Year referral window expired for referee ${refereeId}.`);
      return { 
        success: false, 
        reason: '1-Year referral commission period for this referee has expired.' 
      };
    }

    const referrer = referee.referrer;
    if (!referrer.isActive) {
      console.log(`[ReferralEngine] Skipped: Referrer ${referrer.id} is suspended.`);
      return { success: false, reason: 'Referrer account is suspended.' };
    }

    // 4. Calculate Commission Amount
    let rewardAmount = 0;
    let serviceLabel = serviceType.replace(/_/g, ' ');

    const service = await prisma.service.findUnique({ where: { code: serviceType } });
    if (service && service.referralReward) {
      rewardAmount = Number(service.referralReward);
      serviceLabel = service.name;
    }

    if (rewardAmount <= 0) {
      console.log(`[ReferralEngine] Skipped: Service ${serviceType} has ₦0 referral reward configured in database.`);
      return { success: false, reason: 'No referral commission configured for this service.' };
    }

    // 5. Idempotency Check: prevent duplicate rewards for the same service request/reference
    const existingEarning = await prisma.referralEarning.findFirst({
      where: {
        OR: [
          { reference: `REF-COMM-${reference}` },
          ...(serviceRequestId ? [{ serviceRequestId }] : []),
        ],
      },
    });

    if (existingEarning) {
      console.log(`[ReferralEngine] Skipped: Commission already distributed for reference ${reference}.`);
      return { success: false, reason: 'Commission already distributed for this service.' };
    }

    const commissionRef = `REF-COMM-${reference}-${Date.now().toString().slice(-4)}`;

    // 6. Atomically credit Referrer balance, log transaction, and create ReferralEarning entry
    await prisma.$transaction(async (tx) => {
      // A. Credit Referrer's Referral Earnings
      await tx.user.update({
        where: { id: referrer.id },
        data: {
          referralEarningsBalance: { increment: rewardAmount },
          referralEarningsTotal: { increment: rewardAmount },
        },
      });

      // B. Create Referral Earning Record
      await tx.referralEarning.create({
        data: {
          referrerId: referrer.id,
          refereeId: referee.id,
          serviceType: serviceType,
          serviceRequestId: serviceRequestId,
          amount: rewardAmount,
          reference: commissionRef,
          channel: 'DASHBOARD',
          status: 'COMPLETED',
        },
      });

      // C. Create Transaction Audit Record
      await tx.transaction.create({
        data: {
          userId: referrer.id,
          amount: rewardAmount,
          type: 'BONUS',
          status: 'COMPLETED',
          reference: commissionRef,
          description: `Referral Commission from ${referee.firstName} for ${serviceLabel}`,
          serviceId: serviceType,
        },
      });
    });

    console.log(`[ReferralEngine] ✅ Successfully credited ₦${rewardAmount} to referrer ${referrer.id} (${referrer.firstName}) for referee ${referee.id}'s ${serviceLabel}!`);
    return { success: true, rewardedAmount: rewardAmount };
  } catch (error) {
    console.error('[ReferralEngine] ❌ Error distributing referral commission:', error);
    return { success: false, reason: 'Internal error while processing referral commission.' };
  }
}
