import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    // 1. Authenticate (Must be Admin)
    const user = await validateApiKey(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ status: false, error: 'Unauthorized Access' }, { status: 403 });
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const requestId = formData.get('requestId') as string;
    const action = formData.get('action') as string; // 'APPROVE' or 'REJECT'
    const adminNote = formData.get('note') as string;
    const resultFile = formData.get('file') as File | null;

    if (!requestId || !action) {
      return NextResponse.json({ status: false, error: 'Missing requestId or action' }, { status: 400 });
    }

    // 3. Fetch Request to check validity & cost (for refunds)
    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { user: true } // Need user info for refund
    });

    if (!request) {
      return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    if (request.status === 'COMPLETED' || request.status === 'FAILED') {
      return NextResponse.json({ status: false, error: 'Request already processed' }, { status: 400 });
    }

    // --- CASE A: APPROVE / COMPLETE ---
    if (action === 'APPROVE') {
      let responseData: any = request.responseData || {};

      // If a file was uploaded (e.g., CAC Certificate, NIN Slip), upload it
      if (resultFile) {
        const upload = await uploadToCloudinary(resultFile, 'agentlink/admin_replies');
        
        // Save the URL in the response data
        // This is what the User will see in their dashboard
        responseData.resultUrl = upload.secure_url;
        responseData.resultPublicId = upload.public_id;
        responseData.completionDate = new Date().toISOString();
      }

      // Update DB
      await prisma.serviceRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          adminNote: adminNote || 'Request Completed Successfully',
          responseData: responseData // Updates with the file URL
        }
      });

      return NextResponse.json({
        status: true,
        message: 'Request Approved & File Sent',
        data: {
          status: 'COMPLETED',
          result_url: responseData.resultUrl || null
        }
      });
    }

    // --- CASE B: REJECT (AUTO-REFUND) ---
    else if (action === 'REJECT') {
      const refundAmount = Number(request.cost);

      await prisma.$transaction(async (tx) => {
        // 1. Refund User Wallet
        await tx.user.update({
          where: { id: request.userId },
          data: { walletBalance: { increment: refundAmount } }
        });

        // 2. Log Refund Transaction
        await tx.transaction.create({
          data: {
            userId: request.userId,
            amount: refundAmount,
            type: 'REFUND',
            status: 'COMPLETED',
            reference: `REF-${requestId.slice(-8)}-${Date.now()}`,
            description: `Refund for Request #${requestId.slice(-6)}`,
            serviceId: request.serviceType // Optional: link to service
          }
        });

        // 3. Mark Request as FAILED
        await tx.serviceRequest.update({
          where: { id: requestId },
          data: {
            status: 'FAILED',
            adminNote: adminNote || 'Request Rejected by Admin',
          }
        });
      });

      return NextResponse.json({
        status: true,
        message: 'Request Rejected & User Refunded',
        data: {
          status: 'FAILED',
          refunded_amount: refundAmount
        }
      });
    }

    return NextResponse.json({ status: false, error: 'Invalid Action' }, { status: 400 });

  } catch (error) {
    console.error("Admin Action Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
