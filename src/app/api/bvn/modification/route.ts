import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

// --- CONFIGURATION ---
const SURCHARGE_THRESHOLD_YEARS = 5;
const SURCHARGE_AMOUNT = 4000.00;

// Helper: Calculate Date Difference
function getYearDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365)); 
}

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { 
      service_code,       // The Category (e.g., 620 for Change of Name)
      bank_code,          // The Bank (e.g., 706 for First Bank)
      reference, 
      nin, 
      bvn, 
      old_details, 
      new_details,
      new_phone_number 
    } = body;

    // --- 1. BASIC VALIDATION ---
    if (!service_code || !bank_code || !reference) return NextResponse.json({ status: false, error: 'Missing service_code, bank_code, or reference' }, { status: 400 });
    if (!nin || nin.length !== 11) return NextResponse.json({ status: false, error: 'Invalid NIN' }, { status: 400 });
    if (!bvn || bvn.length !== 11) return NextResponse.json({ status: false, error: 'Invalid BVN' }, { status: 400 });

    // --- 2. VALIDATE BANK AVAILABILITY ---
    const bankService = await prisma.service.findUnique({ where: { serviceCode: Number(bank_code) } });
    if (!bankService || !bankService.code.toString().startsWith('BANK_')) {
      return NextResponse.json({ status: false, error: 'Invalid Bank Code' }, { status: 404 });
    }
    if (!bankService.isActive) {
      return NextResponse.json({ status: false, error: `Service Unavailable for ${bankService.name.replace('Bank: ', '')}` }, { status: 503 });
    }

    // --- 3. VALIDATE MODIFICATION CATEGORY & FIELDS ---
    const modService = await prisma.service.findUnique({ where: { serviceCode: Number(service_code) } });
    if (!modService || !modService.isActive || !modService.code.toString().startsWith('BVN_MOD_')) {
      return NextResponse.json({ status: false, error: 'Invalid Modification Service Code' }, { status: 404 });
    }

    const code = modService.code; // e.g., BVN_MOD_NAME

    // RULES: "Old Details" and "New Details" (Name/DOB) are ALWAYS compulsory for identification
    if (!old_details?.first_name || !old_details?.surname || !old_details?.middle_name || !old_details?.dob) {
        return NextResponse.json({ status: false, error: 'Missing Compulsory Old Details (first_name, surname, middle_name, dob)' }, { status: 400 });
    }
    if (!new_details?.first_name || !new_details?.surname || !new_details?.middle_name || !new_details?.dob) {
        return NextResponse.json({ status: false, error: 'Missing Compulsory New Details (first_name, surname, middle_name, dob)' }, { status: 400 });
    }

    // RULES: Specific Field Requirements per Category
    // Categories involving PHONE need `new_phone_number`
    const phoneCategories = ['BVN_MOD_PHONE', 'BVN_MOD_NAME_PHONE', 'BVN_MOD_DOB_PHONE', 'BVN_MOD_FULL'];
    if (phoneCategories.includes(code.toString()) && !new_phone_number) {
        return NextResponse.json({ status: false, error: 'New Phone Number is required for this category' }, { status: 400 });
    }

    // --- 4. PRICING & SURCHARGE ---
    let finalCost = Number(modService.price);
    let surchargeApplied = false;

    // Apply Surcharge if DOB Category + Gap > 5 Years
    const dobCategories = ['BVN_MOD_DOB', 'BVN_MOD_DOB_PHONE', 'BVN_MOD_FULL'];
    if (dobCategories.includes(code.toString())) {
        const yearsDiff = getYearDifference(old_details.dob, new_details.dob);
        if (old_details.dob !== new_details.dob && yearsDiff > SURCHARGE_THRESHOLD_YEARS) {
            finalCost += SURCHARGE_AMOUNT;
            surchargeApplied = true;
        }
    }

    // --- 5. CHARGE WALLET ---
    if (Number(user.walletBalance) < finalCost) {
      return NextResponse.json({ status: false, error: `Insufficient funds. Cost: ₦${finalCost}` }, { status: 402 });
    }

    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { walletBalance: { decrement: finalCost } } });
      
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: modService.code, // Log as the Mod Type (e.g. Change Name)
          status: 'PROCESSING',
          cost: finalCost,
          requestData: {
            bank_name: bankService.name.replace('Bank: ', ''),
            nin, bvn,
            old_details, new_details, new_phone_number,
            clientReference: reference,
            surcharge_applied: surchargeApplied
          },
          adminNote: surchargeApplied ? 'Age Surcharge Applied' : 'Pending Modification'
        }
      });
    });

    // --- 6. SUCCESS RESPONSE ---
    return NextResponse.json({
      status: true,
      message: 'Modification Request Submitted',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: finalCost,
        bank: bankService.name.replace('Bank: ', ''),
        service: modService.name
      }
    });

  } catch (error) {
    console.error("BVN Mod Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
