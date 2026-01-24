import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Auth
    const user = await validateApiKey(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Parse Data
    const formData = await req.formData();
    const requestId = formData.get('requestId') as string;
    const action = formData.get('action') as string; // 'APPROVE' | 'REJECT'
    const note = formData.get('note') as string;
    const file = formData.get('file') as File | null;
    
    // Custom Refund Logic
    const refundAmountRaw = formData.get('refund_amount');
    const refundAmount = refundAmountRaw ? Number(refundAmountRaw) : null;

    if (!requestId || !action) {
        return NextResponse.json({ status: false, error: 'Missing ID or Action' }, { status: 400 });
    }

    // 3. Get Request
    const request = await prisma.serviceRequest.findUnique({
        where: { id: requestId },
        include: { user: true }
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    if (request.status !== 'PROCESSING') return NextResponse.json({ status: false, error: 'Request already processed' }, { status: 400 });

    // 4. Handle Actions
    const result = await prisma.$transaction(async (tx) => {
        
        let responseData: any = request.responseData || {};

        if (action === 'APPROVE') {
            // Upload Logic (Placeholder - add your cloudinary logic if needed)
            let resultUrl = null;
            
            // Note: If you are using Cloudinary or local upload, implement it here.
            // For now, we assume the file handling is done or skipped if unnecessary.
            
            if (resultUrl) responseData.resultUrl = resultUrl;

            // Update Request
            return await tx.serviceRequest.update({
                where: { id: requestId },
                data: {
                    status: 'COMPLETED',
                    adminNote: note,
                    responseData: responseData,
                    updatedAt: new Date()
                }
            });

        } else if (action === 'REJECT') {
            
            // Refund Logic
            const amountToRefund = refundAmount !== null ? refundAmount : Number(request.cost);

            if (amountToRefund > 0) {
                // Credit User Wallet
                await tx.user.update({
                    where: { id: request.userId },
                    data: { walletBalance: { increment: amountToRefund } }
                });

                // Log Transaction
                // FIX: Added 'REFUND-' prefix and timestamp to ensure uniqueness
                await tx.transaction.create({
                    data: {
                        userId: request.userId,
                        type: 'REFUND',
                        amount: amountToRefund,
                        status: 'COMPLETED',
                        // Uniqueness Fix:
                        reference: `REFUND-${request.id.slice(0,6)}-${Date.now().toString().slice(-4)}`,
                        description: `Refund for ${request.serviceType} (${requestId.slice(0,5)})`
                    }
                });
            }

            // Update Request
            return await tx.serviceRequest.update({
                where: { id: requestId },
                data: {
                    status: 'FAILED',
                    adminNote: note,
                    updatedAt: new Date()
                }
            });
        }
    });

    return NextResponse.json({ status: true, message: 'Action Successful', data: result });

  } catch (error) {
    console.error("Action Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
