import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { sendEmail, emailTemplates } from '@/lib/zeptomail';

export async function POST(req: Request) {
  try {
    // 1. AUTH CHECK: Ensure it is an Admin calling this API
    const admin = await validateApiKey(req);
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action } = body; 

    if (!userId || !action) {
        return NextResponse.json({ status: false, error: 'Missing userId or action' }, { status: 400 });
    }

    // Prevent Admin from blocking/deleting themselves
    if (userId === admin.id) {
        return NextResponse.json({ status: false, error: 'Self-action denied' }, { status: 400 });
    }

    let updatedUser;
    
    // 2. HANDLE ACTIONS
    switch (action) {
        
        // --- NEW: APPROVE REGISTRATION (With Email) ---
        case 'APPROVE':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { isActive: true } 
            });
            // Send Email
            await sendEmail({
                to: updatedUser.email,
                name: updatedUser.firstName,
                subject: 'Account Approved - Welcome to AgentHub',
                html: emailTemplates.accountApproved(updatedUser.firstName)
            });
            break;

        // --- NEW: REJECT REGISTRATION (With Email) ---
        case 'REJECT':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { isActive: false } 
            });
            // Send Email
            await sendEmail({
                to: updatedUser.email,
                name: updatedUser.firstName,
                subject: 'Registration Status Update',
                html: emailTemplates.accountRejected(updatedUser.firstName)
            });
            break;

        // --- RESTORED: BLOCK USER ---
        case 'BLOCK':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { isActive: false } 
            });
            break;

        // --- RESTORED: UNBLOCK USER ---
        case 'UNBLOCK':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { isActive: true }
            });
            break;

        // --- RESTORED: MAKE ADMIN ---
        case 'MAKE_ADMIN':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { role: 'ADMIN' }
            });
            break;

        // --- RESTORED: REMOVE ADMIN ---
        case 'REMOVE_ADMIN':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { role: 'AGENT' }
            });
            break;

        // --- RESTORED: DELETE USER ---
        case 'DELETE':
            const hasHistory = await prisma.serviceRequest.count({ where: { userId } });
            if (hasHistory > 0) {
                // Soft Delete: Scramble data to keep logs integrity
                updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: { 
                        isActive: false, 
                        email: `deleted_${userId}_${Date.now()}@deleted.com`,
                        firstName: 'Deleted User',
                        lastName: '(Removed)',
                        phoneNumber: '0000000000'
                    }
                });
                return NextResponse.json({ status: true, message: 'User Deactivated (History Preserved)' });
            } else {
                // Hard Delete: Safe to remove
                await prisma.user.delete({ where: { id: userId } });
                return NextResponse.json({ status: true, message: 'User Deleted Permanently' });
            }

        default:
            return NextResponse.json({ status: false, error: 'Invalid Action' }, { status: 400 });
    }

    return NextResponse.json({ status: true, success: true, user: updatedUser });

  } catch (error) {
    console.error('Admin Action Error:', error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
