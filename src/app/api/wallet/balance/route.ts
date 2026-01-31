import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';

// Force dynamic since we fetch fresh data every time
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Authenticate & Fetch Latest User Data
    // validateApiKey fetches the user from DB, so it contains the fresh balance
    const user = await validateApiKey(req);

    if (!user) {
      return NextResponse.json({ status: false, error: 'Unauthorized. Invalid API Key.' }, { status: 401 });
    }

    // 2. Return Balance
    return NextResponse.json({
      status: true,
      message: 'Wallet Balance Retrieved',
      data: {
        balance: Number(user.walletBalance),
        currency: 'NGN',
        account_name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Wallet Balance Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
