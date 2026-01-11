import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { 
      reference,
      business_details,
      proprietor_details,
      documents
    } = body;

    // --- 2. VALIDATION: TOP LEVEL ---
    if (!reference) return NextResponse.json({ status: false, error: 'Missing reference' }, { status: 400 });
    if (!business_details || !proprietor_details || !documents) {
        return NextResponse.json({ status: false, error: 'Missing required objects: business_details, proprietor_details, or documents' }, { status: 400 });
    }

    // --- 3. VALIDATION: BUSINESS DETAILS ---
    const busErrors = [];
    if (!business_details.proposed_name_1) busErrors.push('proposed_name_1');
    if (!business_details.proposed_name_2) busErrors.push('proposed_name_2');
    if (!business_details.nature_of_business) busErrors.push('nature_of_business');
    if (!business_details.description) busErrors.push('description');
    if (!business_details.address) busErrors.push('address');
    if (!business_details.state) busErrors.push('state');
    if (!business_details.lga) busErrors.push('lga');

    if (busErrors.length > 0) {
        return NextResponse.json({ status: false, error: `Missing Business Details: ${busErrors.join(', ')}` }, { status: 400 });
    }

    // --- 4. VALIDATION: PROPRIETOR DETAILS ---
    const propErrors = [];
    if (!proprietor_details.firstname) propErrors.push('firstname');
    if (!proprietor_details.surname) propErrors.push('surname');
    // Middle name is Optional, so we don't check it
    if (!proprietor_details.nin) propErrors.push('nin');
    if (!proprietor_details.address) propErrors.push('address');
    if (!proprietor_details.phone) propErrors.push('phone');
    if (!proprietor_details.email) propErrors.push('email');
    if (!proprietor_details.state) propErrors.push('state');
    if (!proprietor_details.lga) propErrors.push('lga');

    if (propErrors.length > 0) {
        return NextResponse.json({ status: false, error: `Missing Proprietor Details: ${propErrors.join(', ')}` }, { status: 400 });
    }

    // --- 5. VALIDATION: DOCUMENTS (BASE64) ---
    const docErrors = [];
    if (!documents.passport_photo) docErrors.push('passport_photo');
    if (!documents.signature) docErrors.push('signature');
    if (!documents.nin_slip) docErrors.push('nin_slip');

    if (docErrors.length > 0) {
        return NextResponse.json({ status: false, error: `Missing Documents (Base64): ${docErrors.join(', ')}` }, { status: 400 });
    }

    // --- 6. GET PRICE & CHECK BALANCE ---
    const service = await prisma.service.findUnique({ where: { code: 'CAC_REGISTRATION' } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'CAC Service Unavailable' }, { status: 503 });

    const cost = Number(service.price);

    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: `Insufficient funds. Cost: ₦${cost.toLocaleString()}` }, { status: 402 });
    }

    // --- 7. CHARGE & LOG ---
    const requestLog = await prisma.$transaction(async (tx) => {
      // Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      // Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'CAC_REGISTRATION',
          status: 'PROCESSING',
          cost: cost,
          requestData: {
            clientReference: reference,
            business_details,
            proprietor_details,
            // We store documents. In production, uploading these to S3/Cloudinary and storing URLs is better.
            // For now, storing Base64 in JSON is acceptable if < 10MB total.
            documents 
          },
          adminNote: 'Pending CAC Registration'
        }
      });
    });

    // --- 8. SUCCESS RESPONSE ---
    return NextResponse.json({
      status: true,
      message: 'CAC Registration Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: cost,
        note: 'Admin will review and provide Certificate + Status Report upon success.'
      }
    });

  } catch (error) {
    console.error("CAC Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
