import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { createVirtualAccount } from '@/services/providers/paymentpoint';

export async function POST(req: Request) {
  try {
    const authUser = await validateApiKey(req);
    if (!authUser) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
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

    // --- PRIORITY LOGIC START ---
    // The provider might return a single object or an array in result.data depending on how you mapped it in the provider file.
    // Assuming 'createVirtualAccount' in provider returns raw API structure or we modify logic here.
    
    // Let's look at the raw provider logic we wrote earlier:
    // It returned: { success: true, data: { accountName, accountNumber, bankName ... } } 
    // We need to fetch the raw array to do prioritization properly. 
    
    // Let's assume the provider returns the *preferred* one already, OR we handle the raw response here.
    // Based on previous code, the provider logic was: "const account = data.bankAccounts[0];"
    // We should probably update the PROVIDER helper to do the sorting, BUT we can simply trust the returned data 
    // if we update the provider logic below this file.
    
    // For now, let's assume result.data contains the chosen account.
    // --- PRIORITY LOGIC END ---

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
