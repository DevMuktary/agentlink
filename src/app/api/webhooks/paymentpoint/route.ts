import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Parse Payload directly
    const body = await req.json();
    console.log("Webhook Payload Received:", JSON.stringify(body, null, 2));

    const { 
      transaction_id, 
      settlement_amount, 
      customer, 
      transaction_status, 
      sender 
    } = body;

    // 2. Safety Check: Only process 'success' status
    if (transaction_status !== 'success') {
        return NextResponse.json({ status: 'ignored', message: 'Transaction not successful' });
    }

    // 3. Idempotency Check: Stop if we already processed this ID
    const existingTx = await prisma.transaction.findUnique({
        where: { reference: transaction_id }
    });

    if (existingTx) {
        // Return 200 so they stop sending the webhook
        return NextResponse.json({ status: 'duplicate', message: 'Transaction already processed' });
    }

    // 4. Find the User
    if (!customer?.email) {
        return NextResponse.json({ error: 'No email in payload' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email: customer.email }
    });

    if (!user) {
        console.error(`Webhook Error: User not found for email ${customer.email}`);
        // Return 200 to acknowledge receipt even if user is missing (stops retries)
        return NextResponse.json({ status: 'error', message: 'User not found' });
    }

    // 5. Fund Wallet & Log Transaction
    await prisma.$transaction([
        // Credit the User
        prisma.user.update({
            where: { id: user.id },
            data: { walletBalance: { increment: Number(settlement_amount) } }
        }),
        // Create Transaction Record
        prisma.transaction.create({
            data: {
                userId: user.id,
                amount: Number(settlement_amount),
                type: 'DEPOSIT',
                status: 'COMPLETED',
                reference: transaction_id,
                description: `Wallet Funding via ${sender?.bank || 'Bank Transfer'}`,
                serviceId: 'WALLET_FUNDING'
            }
        })
    ]);

    console.log(`✅ Wallet Funded: ₦${settlement_amount} for ${user.email}`);
    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error("Webhook Processing Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
