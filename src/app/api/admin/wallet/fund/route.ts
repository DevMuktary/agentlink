import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Auth Check (Admin Only)
    const admin = await validateApiKey(req);
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, amount } = body;

    if (!userId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ status: false, error: 'Invalid User or Amount' }, { status: 400 });
    }

    // 2. Perform Transaction (Update Balance + Create Log)
    const result = await prisma.$transaction(async (tx) => {
        
        // A. Update User Wallet
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { 
                walletBalance: { increment: Number(amount) } 
            }
        });

        // B. Create Transaction Record
        const transaction = await tx.transaction.create({
            data: {
                userId: userId,
                type: 'DEPOSIT', // or 'MANUAL_CREDIT'
                amount: Number(amount),
                status: 'COMPLETED',
                reference: `MNL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                description: `Manual funding by Admin (${admin.firstName})`
            }
        });

        return { user: updatedUser, transaction };
    });

    return NextResponse.json({ 
        status: true, 
        message: 'Wallet Funded Successfully', 
        newBalance: result.user.walletBalance 
    });

  } catch (error) {
    console.error("Manual Funding Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
