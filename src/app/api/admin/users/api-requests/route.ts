import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const admin = await validateApiKey(req);
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all users who have requested API access
    const pendingUsers = await prisma.user.findMany({
      where: { apiStatus: 'PENDING' },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        businessName: true,
        websiteUrl: true, // Matches your DB Schema
        role: true,
        apiStatus: true,
        walletBalance: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ status: true, data: pendingUsers });
  } catch (error) {
    console.error("Fetch API Requests Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await validateApiKey(req);
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (!userId || !action) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (action === 'APPROVE') {
        // Generate secure API Keys matching your live credentials flow
        const newPublic = user.apiKeyPublic || 'pk_live_' + crypto.randomBytes(12).toString('hex');
        const newSecret = user.apiKeySecret || 'sk_live_' + crypto.randomBytes(24).toString('hex');
        
        await prisma.user.update({
            where: { id: userId },
            data: { 
                apiStatus: 'APPROVED', // Matches your DB Enum
                apiKeyPublic: newPublic, 
                apiKeySecret: newSecret 
            }
        });
    } else if (action === 'REJECT') {
        await prisma.user.update({
            where: { id: userId },
            data: { apiStatus: 'REJECTED' }
        });
    }

    return NextResponse.json({ status: true, success: true });
  } catch (error) {
    console.error("Action API Request Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
