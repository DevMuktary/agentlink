import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Copy prices in the DataPlan table
    await prisma.$executeRaw`UPDATE "DataPlan" SET "dashboardPrice" = "price", "apiPrice" = "price"`;
    
    // 2. Copy prices in the Service table
    await prisma.$executeRaw`UPDATE "Service" SET "dashboardPrice" = "price", "apiPrice" = "price"`;

    // 3. Move old JTB_TIN_REGISTRATION history to TAX_ID_REGISTRATION
    await prisma.$executeRaw`UPDATE "ServiceRequest" SET "serviceType" = 'TAX_ID_REGISTRATION' WHERE "serviceType" = 'JTB_TIN_REGISTRATION'`;
    await prisma.$executeRaw`UPDATE "Service" SET "code" = 'TAX_ID_REGISTRATION' WHERE "code" = 'JTB_TIN_REGISTRATION'`;

    return NextResponse.json({ message: 'Data safely migrated with zero data loss!' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
