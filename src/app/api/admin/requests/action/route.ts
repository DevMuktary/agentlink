import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const requestId = formData.get('requestId') as string;
    const action = formData.get('action') as string;
    const note = formData.get('note') as string;
    const refundAmount = formData.get('refund_amount');
    
    // CAPTURE THE BVN TEXT
    const resultText = formData.get('result_text') as string; 
    
    const file = formData.get('file') as File | null;

    if (!requestId || !action) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const request = await prisma.serviceRequest.findUnique({
        where: { id: requestId },
        include: { user: true }
    });

    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    // Handle File Upload
    let fileUrl = null;
    if (file) {
        const upload = await uploadToCloudinary(file, 'agentlink/results');
        fileUrl = upload.secure_url;
    }

    // Handle Refund
    if (action === 'REJECT' && refundAmount) {
        const amount = parseFloat(refundAmount.toString());
        if (amount > 0) {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: request.userId },
                    data: { walletBalance: { increment: amount } }
                }),
                prisma.transaction.create({
                    data: {
                        userId: request.userId,
                        amount: amount,
                        type: 'REFUND',
                        status: 'COMPLETED',
                        reference: `REF-${request.id.slice(0,8)}`,
                        description: `Refund for rejected request ${request.id}`,
                        serviceId: 'ADMIN_REFUND'
                    }
                })
            ]);
        }
    }

    // UPDATE REQUEST STATUS
    let responseData: any = request.responseData || {};
    
    // THIS IS THE FIX: SAVE BVN TO RESPONSE DATA
    if (resultText) {
        responseData.bvn = resultText;
        responseData.number = resultText; // Save as both for safety
    }
    
    if (fileUrl) {
        responseData.resultUrl = fileUrl;
        responseData.slip_url = fileUrl;
    }

    await prisma.serviceRequest.update({
        where: { id: requestId },
        data: {
            status: action === 'APPROVE' ? 'COMPLETED' : 'FAILED',
            adminNote: note,
            responseData: responseData, // Save the updated JSON
        }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin Action Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
