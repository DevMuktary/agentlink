// src/app/api/admin/migrate-data/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Copy prices over
    await prisma.$executeRaw`UPDATE "DataPlan" SET "dashboardPrice" = "price", "apiPrice" = "price"`;
    await prisma.$executeRaw`UPDATE "Service" SET "dashboardPrice" = "price", "apiPrice" = "price"`;

    // 2. Map old JTB history to Individual Tax ID (or remove these two lines to just leave them as JTB_TIN_REGISTRATION in history)
    await prisma.$executeRaw`UPDATE "ServiceRequest" SET "serviceType" = 'TAX_ID_INDIVIDUAL' WHERE "serviceType" = 'JTB_TIN_REGISTRATION'`;
    await prisma.$executeRaw`UPDATE "Service" SET "code" = 'TAX_ID_INDIVIDUAL' WHERE "code" = 'JTB_TIN_REGISTRATION'`;

    return NextResponse.json({ message: 'Prices successfully copied and data migrated!' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
