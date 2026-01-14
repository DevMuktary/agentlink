import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // validateApiKey checks both Header (API Key) and Cookie (Session)
    const user = await validateApiKey(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return the full user object (includes role, walletBalance, etc.)
    return NextResponse.json(user);
    
  } catch (error) {
    console.error("User Me Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
