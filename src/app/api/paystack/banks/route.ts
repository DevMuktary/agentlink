import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { fetchPaystackBanks } from '@/services/paystack.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await fetchPaystackBanks();
    if (!result.success) {
      return NextResponse.json({ status: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ status: true, data: result.data });
  } catch (error) {
    console.error('Error in Paystack banks route:', error);
    return NextResponse.json({ status: false, error: 'Server error loading banks' }, { status: 500 });
  }
}
