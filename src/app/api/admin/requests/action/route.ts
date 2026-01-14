import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Admin Security Check
    const user = await validateApiKey(req);
    
    // Explicitly check if user exists first to satisfy TypeScript
    if (!user) {
        return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Now TypeScript knows 'user' is not null, but we must ensure 'role' is accessible.
    // The update to api-auth.ts guarantees 'role' is in the returned object.
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ status: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { request_id, action, response_data, rejection_reason, refund_amount } = body;

    if (!request_id || !action) return NextResponse.json({ status: false, error: 'Missing request_id or action' }, { status: 400 });

    // 2. Fetch Request
    const request = await prisma.serviceRequest.findUnique({
        where: { id: request_id },
        include: { user: true }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    if (request.status !== 'PROCESSING') return NextResponse.json({ status: false, error: 'Request is not in PROCESSING state' }, { status: 400 });

    // 3. EXECUTE ACTION
    if (action === 'APPROVE') {
        await prisma.serviceRequest.update({
            where: { id: request_id },
            data: {
                status: 'COMPLETED',
                responseData: response_data,
                adminNote: 'Processed by Admin'
            }
        });
        return NextResponse.json({ status: true, message: 'Request Approved & Completed' });

    } else if (action === 'REJECT') {
        if (!rejection_reason) return NextResponse.json({ status: false, error: 'Rejection reason is required' }, { status: 400 });

        const amountToRefund = Number(refund_amount);
        const originalCost = Number(request.cost);

        if (amountToRefund > originalCost) {
            return NextResponse.json({ status: false, error: `Refund amount (₦${amountToRefund}) cannot exceed original cost` }, { status: 400 });
        }

        const transactionOps = [];

        if (amountToRefund > 0) {
            transactionOps.push(
                prisma.user.update({
                    where: { id: request.userId },
                    data: { walletBalance: { increment: amountToRefund } }
                })
            );
            transactionOps.push(
                prisma.transaction.create({
                    data: {
                        userId: request.userId,
                        amount: amountToRefund,
                        type: 'REFUND',
                        status: 'COMPLETED',
                        reference: `REF-${request.id.slice(0,8)}`,
                        description: `Refund for ${request.serviceType}: ${rejection_reason}`
                    }
                })
            );
        }

        transactionOps.push(
            prisma.serviceRequest.update({
                where: { id: request_id },
                data: {
                    status: 'FAILED',
                    adminNote: rejection_reason
                }
            })
        );

        await prisma.$transaction(transactionOps);

        return NextResponse.json({ 
            status: true, 
            message: amountToRefund > 0 ? `Rejected & Refunded ₦${amountToRefund}` : 'Rejected (No Refund)' 
        });
    }

    return NextResponse.json({ status: false, error: 'Invalid Action' }, { status: 400 });

  } catch (error) {
    console.error("Admin Action Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
