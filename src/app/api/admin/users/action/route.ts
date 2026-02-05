import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth'; // Assuming you use this or session check
import { sendEmail, emailTemplates } from '@/lib/zeptomail';

export async function POST(req: Request) {
  try {
    // 1. Auth Check (Ensure it's an Admin)
    // You might use validateApiKey or your session method here
    // For this example, I'll assume you verify admin rights
    const body = await req.json();
    const { userId, action } = body; // action: 'APPROVE' | 'REJECT' | 'BLOCK'

    if (!userId || !action) {
        return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
    }

    // 2. Perform DB Update
    let updatedUser;
    
    // Note: This relies on you having a 'status' or 'isVerified' field in your User Schema.
    // If you don't have one, you might be toggling 'isActive'.
    
    if (action === 'APPROVE') {
        updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: true } // Or status: 'ACTIVE'
        });
        
        // EMAIL: Account Approved
        const name = `${updatedUser.firstName} ${updatedUser.lastName}`;
        await sendEmail({
            to: updatedUser.email,
            name: name,
            subject: 'Account Approved - Welcome to AgentHub',
            html: emailTemplates.accountApproved(name)
        });

    } else if (action === 'REJECT') {
        // Usually we might delete or mark as Rejected
        updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: false } 
        });

        // EMAIL: Account Rejected
        const name = `${updatedUser.firstName} ${updatedUser.lastName}`;
        await sendEmail({
            to: updatedUser.email,
            name: name,
            subject: 'Registration Status Update',
            html: emailTemplates.accountRejected(name)
        });
    }

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('Admin Action Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
