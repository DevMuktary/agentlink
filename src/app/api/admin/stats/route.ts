import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    const user = await validateApiKey(req);
    // Strict Admin Check
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Total Users (Using 'AGENT' as the standard user role)
    const totalUsers = await prisma.user.count({
        where: { role: 'AGENT' }
    });

    // 2. Wallet Liability (Sum of all AGENT balances)
    const walletSum = await prisma.user.aggregate({
        _sum: { walletBalance: true },
        where: { role: 'AGENT' }
    });

    // 3. Pending Requests (Total)
    const pendingRequests = await prisma.serviceRequest.count({
        where: { status: 'PROCESSING' }
    });

    // --- 4. Queue Breakdowns (Counts per service category) ---
    
    // A. Corporate
    const cacCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'CAC_REGISTRATION' }
    });
    const taxCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: { in: ['TAX_ID_INDIVIDUAL', 'TAX_ID_NON_INDIVIDUAL'] } }
    });

    // B. Banking (BVN)
    const bvnEnrollCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'ANDROID_BVN_ENROLLMENT' }
    });
    
    // FIX: Use 'in' with exact Enum values instead of 'contains'
    const bvnModCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: { 
                in: [
                    'BVN_MODIFICATION_NAME', 
                    'BVN_MODIFICATION_DOB', 
                    'BVN_MODIFICATION_PHONE'
                ] 
            } 
        }
    });

    const bvnRetrievalCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'BVN_RETRIEVAL' }
    });
    const vninNibssCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'VNIN_TO_NIBSS' }
    });

    // C. Identity (NIN)
    // FIX: Use 'in' with exact Enum values
    const ninModCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: { 
                in: [
                    'NIN_MODIFICATION_NAME', 
                    'NIN_MODIFICATION_PHONE', 
                    'NIN_MODIFICATION_ADDRESS',
                    'NIN_MODIFICATION_DOB'
                ] 
            } 
        }
    });
    
    const ninValidationCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'NIN_VALIDATION' }
    });

    // D. Education
    // FIX: Use 'in' with exact Enum values
    const jambCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: { 
                in: [
                    'JAMB_SERVICES',
                    'JAMB_ORIGINAL_RESULT', 
                    'JAMB_ADMISSION_LETTER', 
                    'JAMB_REGISTRATION_SLIP', 
                    'JAMB_PROFILE_CODE_RETRIEVAL'
                ] 
            } 
        }
    });

    // 5. Total Revenue (Sum of COMPLETED transactions)
    const revenueSum = await prisma.serviceRequest.aggregate({
        _sum: { cost: true },
        where: { status: 'COMPLETED' }
    });

    return NextResponse.json({
        status: true,
        data: {
            totalUsers: totalUsers || 0,
            walletLiability: Number(walletSum._sum.walletBalance) || 0,
            pendingRequests: pendingRequests || 0,
            totalRevenue: Number(revenueSum._sum.cost) || 0,
            queues: {
                cac: cacCount,
                tax: taxCount,
                bvn_enrollment: bvnEnrollCount,
                bvn_modification: bvnModCount,
                bvn_retrieval: bvnRetrievalCount,
                vnin_nibss: vninNibssCount,
                nin_modification: ninModCount,
                nin_validation: ninValidationCount,
                jamb: jambCount
            }
        }
    });

  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
