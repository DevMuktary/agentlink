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

    // 2. Poll the database to see if the webhook has already processed and credited the user
    // We will check up to 3 times, with a 1-second delay between checks.
    let existingTransaction = null;
    for (let i = 0; i < 3; i++) {
      existingTransaction = await prisma.transaction.findUnique({ 
        where: { reference } 
      });
      
      if (existingTransaction) break; // Found it! Webhook did its job.
      
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000)); 
    }

    // If the webhook already processed it, return success immediately!
    if (existingTransaction) {
      return NextResponse.json({
        status: true,
        message: 'Wallet funded successfully',
        data: {
          amount: existingTransaction.amount,
          reference: reference
        }
      });
    }

    // 3. If the webhook hasn't arrived yet, verify the transaction directly with Squad API
    // This ensures the user actually paid and didn't just send a fake reference to the endpoint.
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
    if (!isSuccessful || data?.transaction_status !== 'success') {
      return NextResponse.json({ status: false, error: 'Transaction was not successful' }, { status: 400 });
    }

    // 5. Return "Pending Webhook" status.
    // Notice: We DO NOT credit the wallet here. The webhook handles the database credit.
    const amountFunded = Number(data.transaction_amount) / 100;

    return NextResponse.json({
      status: true,
      message: 'Payment verified! Awaiting final webhook confirmation to credit wallet.',
      data: {
        amount: amountFunded,
        reference: reference,
        pending_webhook: true // Let the frontend know it might take a moment to reflect
      }
    });

  } catch (error) {
    console.error("Fund Wallet Error:", error);
    return NextResponse.json({ status: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
