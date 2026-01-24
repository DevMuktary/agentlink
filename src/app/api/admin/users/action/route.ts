import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Auth Check (Super Admins only for sensitive actions ideally, but Admin is fine here)
    const admin = await validateApiKey(req);
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Parse Payload
    const body = await req.json();
    const { userId, action } = body;

    if (!userId || !action) {
        return NextResponse.json({ status: false, error: 'Missing userId or action' }, { status: 400 });
    }

    // Prevent Admin from banning themselves
    if (userId === admin.id) {
        return NextResponse.json({ status: false, error: 'You cannot perform this action on yourself.' }, { status: 400 });
    }

    // 3. Execute Actions
    let updatedUser;

    switch (action) {
        case 'BLOCK':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { isActive: false } // Prevents login
            });
            break;

        case 'UNBLOCK':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { isActive: true } // Restores login
            });
            break;

        case 'MAKE_ADMIN':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { role: 'ADMIN' }
            });
            break;

        case 'REMOVE_ADMIN':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { role: 'USER' }
            });
            break;

        case 'DELETE':
            // Check for transactions/requests first to prevent database foreign key errors
            const hasHistory = await prisma.serviceRequest.count({ where: { userId } });
            if (hasHistory > 0) {
                // Soft Delete if they have history (rename email so they can't login, disable account)
                updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: { 
                        isActive: false, 
                        email: `deleted_${userId}_${Date.now()}@deleted.com`,
                        firstName: 'Deleted User',
                        lastName: '(Removed)'
                    }
                });
                return NextResponse.json({ status: true, message: 'User had history. Account Deactivated & Email Scrambled instead of Hard Delete.' });
            } else {
                // Hard Delete if fresh account
                await prisma.user.delete({ where: { id: userId } });
                return NextResponse.json({ status: true, message: 'User Permanently Deleted' });
            }

        default:
            return NextResponse.json({ status: false, error: 'Invalid Action' }, { status: 400 });
    }

    return NextResponse.json({ status: true, message: `User ${action} Successful`, data: updatedUser });

  } catch (error) {
    console.error("User Action Error:", error);
    return NextResponse.json({ status: false, error: 'Server Action Failed' }, { status: 500 });
  }
}
