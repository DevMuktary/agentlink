import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Upgrade existing Active Users (Give them API Access so they don't break)
    // We only update those who currently have 'NONE' so we don't accidentally overwrite anyone already updated
    const approvedCount = await prisma.user.updateMany({
      where: { 
        isActive: true,
        apiStatus: 'NONE'
      },
      data: { 
        apiStatus: 'APPROVED' 
      }
    });

    // 2. Unlock old "Pending" Users (Give them Dashboard Access, but NO API Access)
    const unlockedCount = await prisma.user.updateMany({
      where: { 
        isActive: false 
      },
      data: { 
        isActive: true,
        apiStatus: 'NONE' 
      }
    });

    return NextResponse.json({ 
      message: 'User migration completed successfully!',
      stats: {
        developersUpgraded: approvedCount.count,
        pendingUsersUnlocked: unlockedCount.count
      }
    });

  } catch (error: any) {
    console.error('Migration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
