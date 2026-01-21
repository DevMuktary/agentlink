import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    // 2. Parse FormData
    const formData = await req.formData();
    const getString = (key: string) => formData.get(key) as string | null;

    const service_code = getString('service_code');
    const reference = getString('reference');
    const documentFile = formData.get('document') as File | null; // Supporting Doc (Affidavit/Bill)

    // 3. Validate Common Inputs
    if (!service_code) return NextResponse.json({ status: false, error: 'Missing service_code' }, { status: 400 });
    if (!reference) return NextResponse.json({ status: false, error: 'Missing reference' }, { status: 400 });
    
    // We enforce a document upload for modifications (Best Practice)
    if (!documentFile) {
      return NextResponse.json({ status: false, error: 'Missing supporting document (Affidavit, Marriage Cert, or Utility Bill)' }, { status: 400 });
    }

    // 4. Identify Service & Validate Specific Fields
    let serviceType = '';
    const code = Number(service_code);
    const requestData: any = { service_code: code, clientReference: reference };

    // Extract Common Fields
    const nin = getString('nin');
    const phone_number = getString('phone_number');
    const full_name = getString('full_name');

    if (code === 501) {
        // --- CHANGE OF NAME ---
        serviceType = 'NIN_MODIFICATION_NAME';
        const new_first_name = getString('new_first_name');
        const new_surname = getString('new_surname');

        if (!nin || !phone_number || !new_first_name || !new_surname) {
            return NextResponse.json({ status: false, error: 'Missing fields: nin, phone_number, new_first_name, new_surname' }, { status: 400 });
        }
        
        // Build Data
        requestData.nin = nin;
        requestData.phone_number = phone_number;
        requestData.new_details = { first_name: new_first_name, surname: new_surname };

    } else if (code === 502) {
        // --- CHANGE OF PHONE ---
        serviceType = 'NIN_MODIFICATION_PHONE';
        const new_phone_number = getString('new_phone_number');

        if (!nin || !full_name || !new_phone_number) {
            return NextResponse.json({ status: false, error: 'Missing fields: nin, full_name, new_phone_number' }, { status: 400 });
        }

        // Build Data
        requestData.nin = nin;
        requestData.full_name = full_name;
        requestData.new_phone_number = new_phone_number;

    } else if (code === 503) {
        // --- CHANGE OF ADDRESS ---
        serviceType = 'NIN_MODIFICATION_ADDRESS';
        const new_address = getString('new_address');

        if (!nin || !phone_number || !full_name || !new_address) {
            return NextResponse.json({ status: false, error: 'Missing fields: nin, phone_number, full_name, new_address' }, { status: 400 });
        }

        // Build Data
        requestData.nin = nin;
        requestData.phone_number = phone_number;
        requestData.full_name = full_name;
        requestData.new_address = new_address;

    } else {
        return NextResponse.json({ status: false, error: 'Invalid service_code. Use 501 (Name), 502 (Phone), or 503 (Address).' }, { status: 400 });
    }

    // 5. Upload Document to Cloudinary
    const uploadResult = await uploadToCloudinary(documentFile, 'agentlink/nin_modifications');
    
    // Add URL to request data
    requestData.documentUrl = uploadResult.secure_url;
    requestData.documentPublicId = uploadResult.public_id;

    // 6. Get Price
    const service = await prisma.service.findUnique({ where: { code: serviceType as any } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });

    const cost = Number(service.price);

    // 7. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 8. Process Transaction
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
          serviceType: serviceType as any,
          status: 'PROCESSING',
          cost: cost,
          requestData: requestData,
          adminNote: 'Pending Modification - Document Uploaded'
        }
      });
    });

    // 9. Return Response
    return NextResponse.json({
      status: true,
      message: 'Modification Request Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference,
        service: service.name,
        status: 'PROCESSING',
        charged_amount: cost,
        document_url: uploadResult.secure_url
      }
    });

  } catch (error) {
    console.error("Modification Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
