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

    // 1. Total Users (ONLY APPROVED)
    const totalUsers = await prisma.user.count({
        where: { 
            role: 'AGENT',
            isActive: true 
        }
    });

    // 2. New User Requests (Pending Approval)
    const pendingRegistrations = await prisma.user.count({
        where: { isActive: false }
    });

    // 3. Wallet Liability (Sum of all AGENT balances)
    const walletSum = await prisma.user.aggregate({
        _sum: { walletBalance: true },
        where: { role: 'AGENT' }
    });

    // 4. Pending Service Requests (Total)
    const pendingRequests = await prisma.serviceRequest.count({
        where: { status: 'PROCESSING' }
    });

    // 5. Completed Service Requests (Total Completed Jobs)
    const completedRequests = await prisma.serviceRequest.count({
        where: { status: 'COMPLETED' }
    });

    // --- 6. Queue Breakdowns ---
    const cacCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'CAC_REGISTRATION' }
    });

    const taxCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: { in: ['TAX_ID_INDIVIDUAL', 'TAX_ID_NON_INDIVIDUAL'] } }
    });

    const bvnEnrollCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'ANDROID_BVN_ENROLLMENT' }
    });
    
    const bvnModCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: { 
                in: ['BVN_MODIFICATION', 'BVN_MOD_NAME', 'BVN_MOD_DOB', 'BVN_MOD_PHONE', 'BVN_MOD_NAME_PHONE', 'BVN_MOD_DOB_PHONE', 'BVN_MOD_NAME_DOB', 'BVN_MOD_FULL'] 
            } 
        }
    });

    const bvnRetrievalCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: { in: ['BVN_RETRIEVAL', 'BVN_RETRIEVAL_PHONE', 'BVN_RETRIEVAL_CRM'] }
        }
    });

    const vninNibssCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'VNIN_TO_NIBSS' }
    });

    const ninModCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: { in: ['NIN_MODIFICATION_NAME', 'NIN_MODIFICATION_PHONE', 'NIN_MODIFICATION_ADDRESS'] } 
        }
    });
    
    const ninValidationCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: { in: ['NIN_VALIDATION_NO_RECORD', 'NIN_VALIDATION_UPDATE_RECORD', 'NIN_VALIDATION_VNIN'] }
        }
    });

    const jambCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: { in: ['JAMB_SERVICES', 'JAMB_ORIGINAL_RESULT', 'JAMB_ADMISSION_LETTER', 'JAMB_REGISTRATION_SLIP', 'JAMB_PROFILE_CODE_RETRIEVAL'] } 
        }
    });

    const revenueSum = await prisma.serviceRequest.aggregate({
        _sum: { cost: true },
        where: { status: 'COMPLETED' }
    });

    return NextResponse.json({
        status: true,
        data: {
            totalUsers: totalUsers || 0,
            pendingRegistrations: pendingRegistrations || 0,
            walletLiability: Number(walletSum._sum.walletBalance) || 0,
            pendingRequests: pendingRequests || 0,
            completedRequests: completedRequests || 0, // Now included!
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
