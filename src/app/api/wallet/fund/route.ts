import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json({ status: false, error: 'Transaction reference is required' }, { status: 400 });
    }

    // 2. Check if this reference was already processed
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference }
    });

    if (existingTransaction) {
      return NextResponse.json({ status: false, error: 'Transaction already processed' }, { status: 400 });
    }

    // 3. Verify with Squad API
    const squadSecretKey = process.env.SQUAD_SECRET_KEY;
    if (!squadSecretKey) {
       console.error("Missing SQUAD_SECRET_KEY in environment variables.");
       return NextResponse.json({ status: false, error: 'Payment gateway configuration error' }, { status: 500 });
    }

    // Squad Verification Endpoint
    const verifyUrl = `https://api-d.squadco.com/transaction/verify/${reference}`;
    
    let squadResponse;
    try {
      squadResponse = await axios.get(verifyUrl, {
        headers: {
          Authorization: `Bearer ${squadSecretKey}`
        }
      });
    } catch (err: any) {
      console.error("Squad Verification Error:", err.response?.data || err.message);
      return NextResponse.json({ status: false, error: 'Failed to verify transaction with provider' }, { status: 400 });
    }

    const { status: isSuccessful, data } = squadResponse.data;

    // 4. Validate Squad Response
    // 'success' status means the payment was completely successful on Squad's end.
    if (!isSuccessful || data?.transaction_status !== 'success') {
      return NextResponse.json({ status: false, error: 'Transaction was not successful' }, { status: 400 });
    }

    // Amount returned is in Kobo. Convert back to Naira.
    const amountFunded = Number(data.transaction_amount) / 100;

    // 5. Credit User Wallet securely
    await prisma.$transaction(async (tx) => {
      // Add funds to user
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { increment: amountFunded } }
      });

      // Log the Deposit
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: amountFunded,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          reference: reference,
          description: `Wallet Funding via Card/Bank Transfer`,
        }
      });
    });

    return NextResponse.json({
      status: true,
      message: 'Wallet funded successfully',
      data: {
        amount: amountFunded,
        reference: reference
      }
    });

  } catch (error) {
    console.error("Fund Wallet Error:", error);
    return NextResponse.json({ status: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
