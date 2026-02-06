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
    const { userId, amount, type } = body; // type: 'CREDIT' | 'DEBIT'

    const txType = type || 'CREDIT'; // Default to CREDIT if missing

    if (!userId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ status: false, error: 'Invalid User or Amount' }, { status: 400 });
    }

    const value = Number(amount);

    // 2. Perform Transaction
    const result = await prisma.$transaction(async (tx) => {
        
        // Fetch current balance first if Debiting
        if (txType === 'DEBIT') {
            const currentUser = await tx.user.findUnique({ where: { id: userId } });
            if (!currentUser || Number(currentUser.walletBalance) < value) {
                throw new Error("Insufficient user balance for deduction");
            }
        }

        // A. Update User Wallet
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { 
                walletBalance: txType === 'CREDIT' 
                    ? { increment: value } 
                    : { decrement: value }
            }
        });

        // B. Create Transaction Record
        const transaction = await tx.transaction.create({
            data: {
                userId: userId,
                type: txType === 'CREDIT' ? 'DEPOSIT' : 'MANUAL_DEBIT', 
                amount: value,
                status: 'COMPLETED',
                reference: `MNL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                description: txType === 'CREDIT' 
                    ? `Manual funding by Admin (${admin.firstName})` 
                    : `Manual deduction by Admin (${admin.firstName})`
            }
        });

        return { user: updatedUser, transaction };
    });

    return NextResponse.json({ 
        status: true, 
        message: txType === 'CREDIT' ? 'Wallet Funded Successfully' : 'Wallet Deducted Successfully', 
        newBalance: result.user.walletBalance 
    });

  } catch (error: any) {
    console.error("Manual Wallet Action Error:", error);
    return NextResponse.json({ status: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}
