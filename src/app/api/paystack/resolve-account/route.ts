import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { resolvePaystackAccount } from '@/services/paystack.service';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { accountNumber, bankCode } = await req.json();

    if (!accountNumber || !bankCode) {
      return NextResponse.json({ status: false, error: 'Account number and bank are required.' }, { status: 400 });
    }

    const result = await resolvePaystackAccount(accountNumber, bankCode);
    if (!result.success) {
      return NextResponse.json({ status: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      status: true,
      data: {
        accountName: result.accountName,
        accountNumber: result.accountNumber,
      },
    });
  } catch (error) {
    console.error('Error in Paystack resolve-account route:', error);
    return NextResponse.json({ status: false, error: 'Server error resolving account' }, { status: 500 });
  }
}
