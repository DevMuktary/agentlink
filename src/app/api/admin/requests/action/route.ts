import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth'; // Or your session auth check
import { getServerSession } from 'next-auth'; // If using session
import { authOptions } from '@/lib/auth';     // If using session
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    // 1. Auth (Check Session or API Key depending on your Admin setup)
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Parse Data
    const formData = await req.formData();
    const requestId = formData.get('requestId') as string;
    const action = formData.get('action') as string; // 'APPROVE' | 'REJECT'
    const note = formData.get('note') as string;
    const file = formData.get('file') as File | null;
    
    // --- FIX: Capture the Text Input (BVN/NIN) ---
    const resultText = formData.get('result_text') as string; 

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

    // 4. Handle File Upload (Perform OUTSIDE transaction)
    let uploadedUrl = null;

    if (action === 'APPROVE') {
        if (file) {
            try {
                const uploadRes = await uploadToCloudinary(file, 'agentlink/results');
                uploadedUrl = uploadRes.secure_url;
            } catch (error) {
                console.error("Upload Failed:", error);
                return NextResponse.json({ status: false, error: 'Failed to upload result file' }, { status: 500 });
            }
        }
    }

    // 5. Handle DB Actions
    const result = await prisma.$transaction(async (tx) => {
        
        // Start with existing data so we don't wipe previous info
        let responseData: any = request.responseData || {};

        if (action === 'APPROVE') {
            
            // --- FIX: Save the BVN/Text to DB ---
            if (resultText) {
                responseData.bvn = resultText;     // For BVN endpoints
                responseData.number = resultText;  // Generic fallback
                responseData.nin = resultText;     // For NIN endpoints
            }

            // Save the URL if uploaded
            if (uploadedUrl) {
                responseData.resultUrl = uploadedUrl;
                responseData.slip_url = uploadedUrl;
                responseData.image_url = uploadedUrl;
            }

            // Update Request
            return await tx.serviceRequest.update({
                where: { id: requestId },
                data: {
                    status: 'COMPLETED',
                    adminNote: note,
                    responseData: responseData, // <--- Now contains the BVN
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
                await tx.transaction.create({
                    data: {
                        userId: request.userId,
                        type: 'REFUND',
                        amount: amountToRefund,
                        status: 'COMPLETED',
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
