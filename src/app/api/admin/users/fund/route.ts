import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  const admin = await validateApiKey(req);
  if (!admin || admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') return NextResponse.json({}, { status: 403 });

  const { userId, amount, type, description } = await req.json(); // type: 'CREDIT' or 'DEBIT'
  
  const value = Number(amount);
  if (!value || value <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

  await prisma.$transaction([
    prisma.user.update({
        where: { id: userId },
        data: { 
            walletBalance: type === 'CREDIT' ? { increment: value } : { decrement: value } 
        }
    }),
    prisma.transaction.create({
        data: {
            userId,
            amount: value,
            type: type === 'CREDIT' ? 'DEPOSIT' : 'SERVICE_CHARGE', // Or custom type
            status: 'COMPLETED',
            reference: `ADMIN-${Date.now()}`,
            description: description || `Admin ${type} Adjustment`
        }
    })
  ]);

  return NextResponse.json({ success: true });
}
