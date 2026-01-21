import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { uploadToCloudinary } from '@/lib/cloudinary'; // Import our new helper

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Parse FormData (Not JSON)
    const formData = await req.formData();

    // Helper to get string values safely
    const getString = (key: string) => formData.get(key) as string | null;

    // Extract Text Fields
    const reference = getString('reference');
    const parkway_wallet_id = getString('parkway_wallet_id');
    const bvn = getString('bvn');
    const agent_location = getString('agent_location');
    const bank_name = getString('bank_name');
    const account_number = getString('account_number');
    const account_name = getString('account_name');
    const first_name = getString('first_name');
    const last_name = getString('last_name');
    const email = getString('email');
    const phone_number = getString('phone_number');
    const home_address = getString('home_address');
    const state_of_residence = getString('state_of_residence');
    const date_of_birth = getString('date_of_birth');
    const local_government = getString('local_government');
    const senatorial_district = getString('senatorial_district');

    // Extract Files
    const passportFile = formData.get('passport') as File | null;
    const signatureFile = formData.get('signature') as File | null;

    // 3. Validate Required Text Fields
    if (!reference) return NextResponse.json({ status: false, error: 'Missing reference' }, { status: 400 });

    const missingFields = [];
    if (!parkway_wallet_id) missingFields.push('parkway_wallet_id');
    if (!bvn) missingFields.push('bvn');
    if (!agent_location) missingFields.push('agent_location');
    if (!bank_name) missingFields.push('bank_name');
    if (!account_number) missingFields.push('account_number');
    if (!account_name) missingFields.push('account_name');
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');
    if (!email) missingFields.push('email');
    if (!phone_number) missingFields.push('phone_number');
    if (!home_address) missingFields.push('home_address');
    if (!state_of_residence) missingFields.push('state_of_residence');
    if (!date_of_birth) missingFields.push('date_of_birth');
    if (!local_government) missingFields.push('local_government');
    if (!senatorial_district) missingFields.push('senatorial_district');

    // Validate Files (Assuming they are required for enrollment)
    if (!passportFile) missingFields.push('passport');
    if (!signatureFile) missingFields.push('signature');

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        status: false, 
        error: `Missing Required Fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // 4. Upload Images to Cloudinary
    // We upload them in parallel to save time
    const [passportUpload, signatureUpload] = await Promise.all([
      uploadToCloudinary(passportFile!, 'agentlink/bvn_passports'),
      uploadToCloudinary(signatureFile!, 'agentlink/bvn_signatures')
    ]);

    // 5. Get Price & Check Balance
    const service = await prisma.service.findUnique({ where: { code: 'ANDROID_BVN_ENROLLMENT' } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });

    const cost = Number(service.price);

    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 6. Process Transaction
    const requestLog = await prisma.$transaction(async (tx) => {
      // Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: cost } }
      });

      // Create Request with Image URLs
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'ANDROID_BVN_ENROLLMENT',
          status: 'PROCESSING',
          cost: cost,
          requestData: {
            clientReference: reference,
            parkway_wallet_id,
            bvn,
            agent_location,
            bank_name,
            account_number,
            account_name,
            first_name,
            last_name,
            email,
            phone_number,
            home_address,
            state_of_residence,
            date_of_birth,
            local_government,
            senatorial_district,
            // SAVE URLS, NOT BASE64
            passportUrl: passportUpload.secure_url,
            signatureUrl: signatureUpload.secure_url,
            passportPublicId: passportUpload.public_id, // Useful if we need to delete/update later
            signaturePublicId: signatureUpload.public_id
          },
          adminNote: 'Pending Enrollment Credentials'
        }
      });
    });

    // 7. Return Success
    return NextResponse.json({
      status: true,
      message: 'Enrollment Request Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: cost,
        passport_url: passportUpload.secure_url, // Return the URL so the frontend can display it if needed
        note: 'You will receive an email from NIBSS containing your credentials upon completion.'
      }
    });

  } catch (error) {
    console.error("Enrollment Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
