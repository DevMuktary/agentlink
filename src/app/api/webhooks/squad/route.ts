import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Get the raw body string (required for accurate HMAC hashing)
    const rawBody = await req.text();
    
    // 2. Get Squad's signature from headers
    const signature = req.headers.get('x-squad-encrypted-body');
    const squadSecret = process.env.SQUAD_SECRET_KEY;

    if (!squadSecret) {
      console.error('Webhook Error: SQUAD_SECRET_KEY is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing Squad signature header' }, { status: 400 });
    }

    // 3. Verify the Hash Signature
    // Squad hashes the raw payload using HMAC SHA-512 and your Secret Key
    const hash = crypto.createHmac('sha512', squadSecret).update(rawBody).digest('hex');
    
    if (hash.toUpperCase() !== signature.toUpperCase()) {
      console.error('Webhook Error: Invalid signature hash');
      return NextResponse.json({ error: 'Unauthorized payload' }, { status: 401 });
    }

    // 4. Parse the verified payload
    const payload = JSON.parse(rawBody);

    // 5. Process Successful Charges
    if (payload.Event === 'charge_successful') {
      const bodyData = payload.Body;
      const transactionRef = payload.TransactionRef || bodyData.transaction_ref;
      const email = bodyData.email || bodyData.customer_email;
      
      // Amount is usually sent in Kobo, convert back to Naira
      const amountInKobo = bodyData.amount;
      const amountFunded = Number(amountInKobo) / 100;

      // --- RACE CONDITION PREVENTION (IDEMPOTENCY) ---
      // Check if the frontend already processed this exact reference
      const existingTx = await prisma.transaction.findUnique({
        where: { reference: transactionRef }
      });

      if (existingTx) {
        // We already credited this user from the frontend. Acknowledge and ignore.
        console.log(`Webhook: Ignored duplicate transaction ${transactionRef}`);
        return NextResponse.json({ message: 'Transaction already processed' }, { status: 200 });
      }

      // --- FALLBACK PROCESSING ---
      // Frontend missed it (User closed tab early). We process it here!
      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!user) {
        console.error(`Webhook Error: User with email ${email} not found for ref ${transactionRef}`);
        // Return 200 so Squad doesn't keep retrying a payment for an unknown user
        return NextResponse.json({ message: 'User not found, but acknowledged' }, { status: 200 });
      }

      // Credit the Wallet & Log Transaction securely
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { walletBalance: { increment: amountFunded } }
        });

        await tx.transaction.create({
          data: {
            userId: user.id,
            amount: amountFunded,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            reference: transactionRef,
            description: 'Wallet Funding via Background Webhook (Squad)',
          }
        });
      });

      console.log(`Webhook Success: Funded ₦${amountFunded} for ${email} [Ref: ${transactionRef}]`);
    }

    // Always return a 200 OK fast so Squad knows we received it
    return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });

  } catch (error) {
    console.error('Squad Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
