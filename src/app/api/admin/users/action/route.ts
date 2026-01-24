import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    const admin = await validateApiKey(req);
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action } = body;

    if (!userId || !action) return NextResponse.json({ status: false, error: 'Missing Data' }, { status: 400 });
    if (userId === admin.id) return NextResponse.json({ status: false, error: 'Self-action denied' }, { status: 400 });

    let updatedUser;

    switch (action) {
        case 'BLOCK':
            // Ensure you added `isActive Boolean @default(true)` to User model
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { isActive: false } 
            });
            break;

        case 'UNBLOCK':
            updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { isActive: true }
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
                data: { role: 'AGENT' } // Changed from USER to AGENT (based on your Enum)
            });
            break;

        case 'DELETE':
            const hasHistory = await prisma.serviceRequest.count({ where: { userId } });
            if (hasHistory > 0) {
                // Soft Delete: Scramble email + Deactivate
                updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: { 
                        isActive: false, 
                        email: `deleted_${userId}_${Date.now()}@deleted.com`,
                        firstName: 'Deleted User',
                        lastName: '(Removed)'
                    }
                });
                return NextResponse.json({ status: true, message: 'User Deactivated (Has History)' });
            } else {
                await prisma.user.delete({ where: { id: userId } });
                return NextResponse.json({ status: true, message: 'User Deleted Permanently' });
            }

        default:
            return NextResponse.json({ status: false, error: 'Invalid Action' }, { status: 400 });
    }

    return NextResponse.json({ status: true, message: 'Success', data: updatedUser });

  } catch (error) {
    console.error("User Action Error:", error);
    return NextResponse.json({ status: false, error: 'Action Failed' }, { status: 500 });
  }
}
