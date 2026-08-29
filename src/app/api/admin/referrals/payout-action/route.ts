import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { sendEmail, emailTemplates } from '@/lib/zeptomail';

export async function POST(req: Request) {
  try {
    const admin = await validateApiKey(req);
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { payoutId, action, note } = await req.json();

    if (!payoutId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ status: false, error: 'Invalid payout action parameters.' }, { status: 400 });
    }

    const payout = await prisma.payoutRequest.findUnique({
      where: { id: payoutId },
      include: { user: true },
    });

    if (!payout) {
      return NextResponse.json({ status: false, error: 'Payout request not found.' }, { status: 404 });
    }

    if (payout.status !== 'PENDING') {
      return NextResponse.json({ status: false, error: `Payout has already been ${payout.status.toLowerCase()}.` }, { status: 400 });
    }

    if (action === 'APPROVE') {
      await prisma.payoutRequest.update({
        where: { id: payoutId },
        data: {
          status: 'COMPLETED',
          adminNote: note || 'Marked as Paid by Admin',
          processedAt: new Date(),
        },
      });

      // Send Email Notification to Agent
      if (payout.user?.email) {
        sendEmail({
          to: payout.user.email,
          name: `${payout.user.firstName} ${payout.user.lastName}`,
          subject: 'Referral Payout Processed - AgentHub',
          html: emailTemplates.payoutStatusUpdate(
            `${payout.user.firstName} ${payout.user.lastName}`,
            Number(payout.amount),
            'COMPLETED',
            payout.bankName || undefined,
            payout.accountNumber || undefined,
            note || undefined
          ),
        }).catch((e) => console.error('Payout Email Error:', e));
      }

      return NextResponse.json({
        status: true,
        message: `Payout of ₦${Number(payout.amount).toLocaleString()} to ${payout.user.firstName} ${payout.user.lastName} marked as COMPLETED!`,
      });
    }

    if (action === 'REJECT') {
      // Refund the requested amount back to the user's available referral earnings balance
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: payout.userId },
          data: {
            referralEarningsBalance: { increment: payout.amount },
          },
        });

        await tx.payoutRequest.update({
          where: { id: payoutId },
          data: {
            status: 'REJECTED',
            adminNote: note || 'Payout rejected by Admin (Funds refunded to referral balance)',
            processedAt: new Date(),
          },
        });
      });

      // Send Email Notification to Agent
      if (payout.user?.email) {
        sendEmail({
          to: payout.user.email,
          name: `${payout.user.firstName} ${payout.user.lastName}`,
          subject: 'Referral Payout Update - AgentHub',
          html: emailTemplates.payoutStatusUpdate(
            `${payout.user.firstName} ${payout.user.lastName}`,
            Number(payout.amount),
            'REJECTED',
            payout.bankName || undefined,
            payout.accountNumber || undefined,
            note || undefined
          ),
        }).catch((e) => console.error('Payout Email Error:', e));
      }

      return NextResponse.json({
        status: true,
        message: `Payout rejected and ₦${Number(payout.amount).toLocaleString()} refunded to ${payout.user.firstName}'s referral balance.`,
      });
    }

    return NextResponse.json({ status: false, error: 'Unhandled action' }, { status: 400 });
  } catch (error) {
    console.error('Error in payout action handler:', error);
    return NextResponse.json({ status: false, error: 'Server error processing payout action.' }, { status: 500 });
  }
}

