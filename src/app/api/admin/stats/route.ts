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

    // --- 4. Queue Breakdowns ---
    
    // CAC
    const cacCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'CAC_REGISTRATION' }
    });

    // TAX
    const taxCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: { in: ['TAX_ID_INDIVIDUAL', 'TAX_ID_NON_INDIVIDUAL'] } }
    });

    // BVN ENROLLMENT
    const bvnEnrollCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'ANDROID_BVN_ENROLLMENT' }
    });
    
    // BVN MODIFICATION (Fixed to match Schema: BVN_MOD_...)
    const bvnModCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: { 
                in: [
                    'BVN_MODIFICATION', // Generic
                    'BVN_MOD_NAME', 
                    'BVN_MOD_DOB', 
                    'BVN_MOD_PHONE', 
                    'BVN_MOD_NAME_PHONE', 
                    'BVN_MOD_DOB_PHONE', 
                    'BVN_MOD_FULL'
                ] 
            } 
        }
    });

    // BVN RETRIEVAL (Grouped all retrieval types)
    const bvnRetrievalCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: {
                in: [
                    'BVN_RETRIEVAL',
                    'BVN_RETRIEVAL_PHONE',
                    'BVN_RETRIEVAL_CRM'
                ]
            }
        }
    });

    const vninNibssCount = await prisma.serviceRequest.count({ 
        where: { status: 'PROCESSING', serviceType: 'VNIN_TO_NIBSS' }
    });

    // NIN MODIFICATION (Removed DOB as it wasn't in the provided schema snippet, kept others)
    const ninModCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: { 
                in: [
                    'NIN_MODIFICATION_NAME', 
                    'NIN_MODIFICATION_PHONE', 
                    'NIN_MODIFICATION_ADDRESS'
                ] 
            } 
        }
    });
    
    // NIN VALIDATION (Grouped specific validation types)
    const ninValidationCount = await prisma.serviceRequest.count({ 
        where: { 
            status: 'PROCESSING', 
            serviceType: {
                in: [
                    'NIN_VALIDATION_NO_RECORD',
                    'NIN_VALIDATION_UPDATE_RECORD',
                    'NIN_VALIDATION_VNIN'
                ]
            }
        }
    });

    // JAMB
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
