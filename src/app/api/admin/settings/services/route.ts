import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  const admin = await validateApiKey(req);
  if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({}, { status: 403 });
  }

  // Fetch Services AND Data Plans
  const services = await prisma.service.findMany({ orderBy: { code: 'asc' } });
  const dataPlans = await prisma.dataPlan.findMany({ orderBy: { network: 'asc' } });

  return NextResponse.json({ services, dataPlans });
}

export async function PUT(req: Request) {
  const admin = await validateApiKey(req);
  if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({}, { status: 403 });
  }

  const { type, id, dashboardPrice, apiPrice, isDashboardActive, isApiActive } = await req.json();

  // Build the update payload dynamically based on what was sent
  const updateData: any = {};
  if (dashboardPrice !== undefined) updateData.dashboardPrice = Number(dashboardPrice);
  if (apiPrice !== undefined) updateData.apiPrice = Number(apiPrice);
  if (isDashboardActive !== undefined) updateData.isDashboardActive = isDashboardActive;
  if (isApiActive !== undefined) updateData.isApiActive = isApiActive;

  try {
      if (type === 'SERVICE') {
        await prisma.service.update({ where: { id }, data: updateData });
      } else {
        await prisma.dataPlan.update({ where: { id }, data: updateData });
      }
      return NextResponse.json({ success: true });
  } catch (error) {
      console.error("Pricing Update Error:", error);
      return NextResponse.json({ error: "Failed to update pricing/status" }, { status: 500 });
  }
}
