import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { createVirtualAccount } from '@/services/providers/paymentpoint';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

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
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
