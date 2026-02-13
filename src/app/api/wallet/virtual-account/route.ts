import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { createVirtualAccount } from '@/services/providers/paymentpoint';

export async function POST(req: Request) {
  try {
    const authUser = await validateApiKey(req);
    if (!authUser) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // FIX: Re-fetch the user to ensure we have the new Virtual Account fields
    // (validateApiKey might return a partial user object)
    const user = await prisma.user.findUnique({
        where: { id: authUser.id }
    });

    if (!user) return NextResponse.json({ status: false, error: 'User record not found' }, { status: 404 });

    // 1. Check if user already has an account
    if (user.virtualAccountNumber) {
        return NextResponse.json({
            status: true,
            message: 'Account already exists',
            data: {
                accountName: user.virtualAccountName,
                accountNumber: user.virtualAccountNumber,
                bankName: user.virtualBankName
            }
        });
    }

    // 2. Generate New Account
    const result = await createVirtualAccount({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phoneNumber || '0000000000'
    });

    if (!result.success || !result.data) {
        return NextResponse.json({ status: false, error: result.error }, { status: 400 });
    }

    // 3. Save to Database
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            virtualAccountName: result.data.accountName,
            virtualAccountNumber: result.data.accountNumber,
            virtualBankName: result.data.bankName,
            paymentPointRef: result.data.customerId
        }
    });

    return NextResponse.json({
        status: true,
        message: 'Virtual Account Created Successfully',
        data: {
            accountName: updatedUser.virtualAccountName,
            accountNumber: updatedUser.virtualAccountNumber,
            bankName: updatedUser.virtualBankName
        }
    });

  } catch (error) {
    console.error("Virtual Account Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
