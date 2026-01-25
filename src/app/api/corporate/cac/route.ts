import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Parse FormData
    const formData = await req.formData();
    const getString = (key: string) => formData.get(key) as string | null;

    // --- EXTRACT FIELDS ---
    const reference = getString('reference');

    // Business Details
    const business_details = {
        proposed_name_1: getString('business_proposed_name_1'),
        proposed_name_2: getString('business_proposed_name_2'),
        nature_of_business: getString('business_nature'),
        description: getString('business_description'),
        address: getString('business_address'),
        state: getString('business_state'),
        lga: getString('business_lga'),
    };

    // Proprietor Details
    const proprietor_details = {
        firstname: getString('proprietor_firstname'),
        surname: getString('proprietor_surname'),
        middle_name: getString('proprietor_middle_name'),
        nin: getString('proprietor_nin'),
        address: getString('proprietor_address'),
        phone: getString('proprietor_phone'),
        email: getString('proprietor_email'),
        state: getString('proprietor_state'),
        lga: getString('proprietor_lga'),
    };

    // Files
    const passportFile = formData.get('passport_photo') as File | null;
    const signatureFile = formData.get('signature') as File | null;
    const ninSlipFile = formData.get('nin_slip') as File | null;

    // --- 3. VALIDATION: TOP LEVEL ---
    if (!reference) return NextResponse.json({ status: false, error: 'Missing reference' }, { status: 400 });

    // --- 4. VALIDATION: BUSINESS DETAILS ---
    const busErrors = [];
    if (!business_details.proposed_name_1) busErrors.push('business_proposed_name_1');
    if (!business_details.proposed_name_2) busErrors.push('business_proposed_name_2');
    if (!business_details.nature_of_business) busErrors.push('business_nature');
    if (!business_details.description) busErrors.push('business_description');
    if (!business_details.address) busErrors.push('business_address');
    if (!business_details.state) busErrors.push('business_state');
    if (!business_details.lga) busErrors.push('business_lga');

    if (busErrors.length > 0) {
        return NextResponse.json({ status: false, error: `Missing Business Details: ${busErrors.join(', ')}` }, { status: 400 });
    }

    // --- 5. VALIDATION: PROPRIETOR DETAILS ---
    const propErrors = [];
    if (!proprietor_details.firstname) propErrors.push('proprietor_firstname');
    if (!proprietor_details.surname) propErrors.push('proprietor_surname');
    if (!proprietor_details.nin) propErrors.push('proprietor_nin');
    if (!proprietor_details.address) propErrors.push('proprietor_address');
    if (!proprietor_details.phone) propErrors.push('proprietor_phone');
    if (!proprietor_details.email) propErrors.push('proprietor_email');
    if (!proprietor_details.state) propErrors.push('proprietor_state');
    if (!proprietor_details.lga) propErrors.push('proprietor_lga');

    if (propErrors.length > 0) {
        return NextResponse.json({ status: false, error: `Missing Proprietor Details: ${propErrors.join(', ')}` }, { status: 400 });
    }

    // --- 6. VALIDATION: DOCUMENTS ---
    const docErrors = [];
    if (!passportFile) docErrors.push('passport_photo');
    if (!signatureFile) docErrors.push('signature');
    if (!ninSlipFile) docErrors.push('nin_slip');

    if (docErrors.length > 0) {
        return NextResponse.json({ status: false, error: `Missing Documents: ${docErrors.join(', ')}` }, { status: 400 });
    }

    // --- 7. UPLOAD TO CLOUDINARY ---
    const [passportUpload, signatureUpload, ninSlipUpload] = await Promise.all([
        uploadToCloudinary(passportFile!, 'agentlink/cac/passports'),
        uploadToCloudinary(signatureFile!, 'agentlink/cac/signatures'),
        uploadToCloudinary(ninSlipFile!, 'agentlink/cac/nin_slips')
    ]);

    // --- 8. GET PRICE & CHECK BALANCE ---
    const service = await prisma.service.findUnique({ where: { code: 'CAC_REGISTRATION' } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'CAC Service Unavailable' }, { status: 503 });

    const cost = Number(service.price);

    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: `Insufficient funds. Cost: ₦${cost.toLocaleString()}` }, { status: 402 });
    }

    // --- 9. CHARGE & LOG ---
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      // B. Create Transaction Record (ADDED)
      await tx.transaction.create({
        data: {
            userId: user.id,
            amount: cost,
            type: 'SERVICE_CHARGE',
            status: 'COMPLETED',
            reference: reference, 
            description: `CAC Registration for ${business_details.proposed_name_1}`,
            serviceId: 'CAC_REGISTRATION'
        }
      });

      // C. Create Request
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
            documents: {
                passport_url: passportUpload.secure_url,
                signature_url: signatureUpload.secure_url,
                nin_slip_url: ninSlipUpload.secure_url,
                passport_id: passportUpload.public_id,
                signature_id: signatureUpload.public_id,
                nin_slip_id: ninSlipUpload.public_id
            }
          },
          adminNote: 'Pending CAC Registration'
        }
      });
    });

    // --- 10. SUCCESS RESPONSE ---
    return NextResponse.json({
      status: true,
      message: 'CAC Registration Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: cost,
        note: 'CAC will review and provide Certificate + Status Report upon success.'
      }
    });

  } catch (error) {
    console.error("CAC Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
