import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  const admin = await validateApiKey(req);
  if (!admin || admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') return NextResponse.json({}, { status: 403 });

  // Fetch Services AND Data Plans
  const services = await prisma.service.findMany({ orderBy: { code: 'asc' } });
  const dataPlans = await prisma.dataPlan.findMany({ orderBy: { network: 'asc' } });

  return NextResponse.json({ services, dataPlans });
}

export async function PUT(req: Request) {
  const admin = await validateApiKey(req);
  if (!admin || admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') return NextResponse.json({}, { status: 403 });

  const { type, id, price, isActive } = await req.json(); // type: 'SERVICE' or 'DATAPLAN'

  if (type === 'SERVICE') {
    await prisma.service.update({ where: { id }, data: { price, isActive } });
  } else {
    await prisma.dataPlan.update({ where: { id }, data: { price, isActive } });
  }

  return NextResponse.json({ success: true });
}
