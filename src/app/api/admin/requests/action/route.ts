import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Admin Security Check
    const user = await validateApiKey(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ status: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { request_id, action, response_data, rejection_reason } = body;

    if (!request_id || !action) return NextResponse.json({ status: false, error: 'Missing request_id or action' }, { status: 400 });

    // 2. Fetch Request
    const request = await prisma.serviceRequest.findUnique({
        where: { id: request_id },
        include: { user: true } // Need user to refund
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    if (request.status !== 'PROCESSING') return NextResponse.json({ status: false, error: 'Request is not in PROCESSING state' }, { status: 400 });

    // 3. EXECUTE ACTION
    if (action === 'APPROVE') {
        // --- APPROVE LOGIC ---
        await prisma.serviceRequest.update({
            where: { id: request_id },
            data: {
                status: 'COMPLETED',
                responseData: response_data, // Save the result (image/text)
                adminNote: 'Processed by Admin'
            }
        });

        return NextResponse.json({ status: true, message: 'Request Approved & Completed' });

    } else if (action === 'REJECT') {
        // --- REJECT LOGIC (WITH REFUND) ---
        if (!rejection_reason) return NextResponse.json({ status: false, error: 'Rejection reason is required' }, { status: 400 });

        await prisma.$transaction([
            // 1. Refund Wallet
            prisma.user.update({
                where: { id: request.userId },
                data: { walletBalance: { increment: request.cost } }
            }),
            // 2. Log Refund Transaction (Optional but good for history)
            prisma.transaction.create({
                data: {
                    userId: request.userId,
                    amount: request.cost,
                    type: 'REFUND',
                    status: 'COMPLETED',
                    reference: `REF-${request.id.slice(0,8)}`,
                    description: `Refund for ${request.serviceType}: ${rejection_reason}`
                }
            }),
            // 3. Mark Request Failed
            prisma.serviceRequest.update({
                where: { id: request_id },
                data: {
                    status: 'FAILED',
                    adminNote: rejection_reason // Save the reason for user to see
                }
            })
        ]);

        return NextResponse.json({ status: true, message: 'Request Rejected & Refunded' });
    }

    return NextResponse.json({ status: false, error: 'Invalid Action' }, { status: 400 });

  } catch (error) {
    console.error("Admin Action Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
