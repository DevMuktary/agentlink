import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { sendEmail, emailTemplates } from '@/lib/zeptomail'; // <--- ADDED IMPORT

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
    
    // --- FILES ---
    const file = formData.get('file') as File | null; // Generic
    const fileCert = formData.get('file_certificate') as File | null; // CAC Cert
    const fileStatus = formData.get('file_status_report') as File | null; // CAC Status
    
    // --- TEXT DATA ---
    const resultText = formData.get('result_text') as string; 
    
    // --- REFUND ---
    const refundAmountRaw = formData.get('refund_amount');
    const refundAmount = refundAmountRaw ? Number(refundAmountRaw) : null;

    if (!requestId || !action) {
        return NextResponse.json({ status: false, error: 'Missing ID or Action' }, { status: 400 });
    }

    // 3. Get Request (Include User for Email)
    const request = await prisma.serviceRequest.findUnique({
        where: { id: requestId },
        include: { user: true } // <--- We need this for the email address
    });

    if (!request) return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    if (request.status !== 'PROCESSING') return NextResponse.json({ status: false, error: 'Request already processed' }, { status: 400 });

    // 4. Handle File Uploads (Perform OUTSIDE transaction)
    let uploadedUrl = null;
    let certUrl = null;
    let statusReportUrl = null;

    if (action === 'APPROVE') {
        try {
            // A. Generic File
            if (file) {
                const uploadRes = await uploadToCloudinary(file, 'agentlink/results');
                uploadedUrl = uploadRes.secure_url;
            }
            // B. CAC Certificate
            if (fileCert) {
                const uploadRes = await uploadToCloudinary(fileCert, 'agentlink/cac/certificates');
                certUrl = uploadRes.secure_url;
            }
            // C. CAC Status Report
            if (fileStatus) {
                const uploadRes = await uploadToCloudinary(fileStatus, 'agentlink/cac/status_reports');
                statusReportUrl = uploadRes.secure_url;
            }
        } catch (error) {
            console.error("Upload Failed:", error);
            return NextResponse.json({ status: false, error: 'Failed to upload files' }, { status: 500 });
        }
    }

    // 5. Handle DB Actions
    const result = await prisma.$transaction(async (tx) => {
        
        // Load existing data
        let responseData: any = (typeof request.responseData === 'object' && request.responseData !== null) 
            ? request.responseData 
            : {};

        if (action === 'APPROVE') {
            
            // Save Text Result (e.g. BVN)
            if (resultText) {
                responseData.bvn = resultText;
                responseData.number = resultText; 
            }

            // Save Generic URL
            if (uploadedUrl) {
                responseData.resultUrl = uploadedUrl; 
                responseData.slip_url = uploadedUrl;
            }

            // Save CAC URLs
            if (certUrl) responseData.certificate_url = certUrl;
            if (statusReportUrl) responseData.status_report_url = statusReportUrl;

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
                // Credit User
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

    // 6. SEND EMAIL NOTIFICATION (New Addition)
    // We send this after the DB transaction succeeds to ensure data consistency
    if (request.user && request.user.email) {
        const finalStatus = action === 'APPROVE' ? 'COMPLETED' : 'FAILED';
        const fullName = `${request.user.firstName} ${request.user.lastName}`;
        const serviceName = request.serviceType.replace(/_/g, ' '); // Format name nicely

        try {
            console.log(`📧 Sending Update Email to ${request.user.email} for ${serviceName}`);
            
            await sendEmail({
                to: request.user.email,
                name: fullName,
                subject: `Request Update: ${serviceName} - AgentHub`,
                html: emailTemplates.serviceStatusUpdate(
                    fullName,
                    serviceName,
                    finalStatus,
                    note
                )
            });
        } catch (emailError) {
            // We log the error but do NOT fail the request, as the DB update was successful
            console.error("Failed to send status update email:", emailError);
        }
    }

    return NextResponse.json({ status: true, message: 'Action Successful', data: result });

  } catch (error) {
    console.error("Action Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
