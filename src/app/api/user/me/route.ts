import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Check Auth
    const auth = await validateApiKey(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Fresh User Data (Including NEW Virtual Account Fields)
    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        walletBalance: true,
        isActive: true,
        createdAt: true,
        
        // --- VIRTUAL ACCOUNT FIELDS (CRITICAL) ---
        virtualAccountName: true,
        virtualAccountNumber: true,
        virtualBankName: true,
      }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ status: true, data: user });

  } catch (error) {
    console.error("User/Me Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
