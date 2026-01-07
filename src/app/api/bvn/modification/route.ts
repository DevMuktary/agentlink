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
      service_code,       
      bank_code,          
      reference, 
      nin, 
      bvn, 
      old_details, 
      new_details,
      new_phone_number 
    } = body;

    // --- 1. CORE VALIDATION ---
    if (!service_code || !bank_code || !reference) return NextResponse.json({ status: false, error: 'Missing service_code, bank_code, or reference' }, { status: 400 });
    if (!nin || nin.length !== 11) return NextResponse.json({ status: false, error: 'Invalid NIN (11 digits required)' }, { status: 400 });
    if (!bvn || bvn.length !== 11) return NextResponse.json({ status: false, error: 'Invalid BVN (11 digits required)' }, { status: 400 });

    // --- 2. VALIDATE COMPULSORY FIELDS (ALL TYPES) ---
    // As per requirements: Old and New Name/DOB details are COMPULSORY for ALL modification types to verify identity.
    
    // Check Old Details (BVN)
    if (!old_details?.first_name || !old_details?.surname || !old_details?.dob) {
        return NextResponse.json({ status: false, error: 'Missing Field in old_details. Required: first_name, surname, middle_name, dob' }, { status: 400 });
    }
    // Middle name might be empty on some old records, but if you want it strict:
    if (old_details.middle_name === undefined) { 
        return NextResponse.json({ status: false, error: 'Missing Field: old_details.middle_name (send empty string if none)' }, { status: 400 });
    }

    // Check New Details (NIN)
    if (!new_details?.first_name || !new_details?.surname || !new_details?.dob) {
        return NextResponse.json({ status: false, error: 'Missing Field in new_details. Required: first_name, surname, middle_name, dob' }, { status: 400 });
    }
    if (new_details.middle_name === undefined) {
        return NextResponse.json({ status: false, error: 'Missing Field: new_details.middle_name (send empty string if none)' }, { status: 400 });
    }

    // --- 3. VALIDATE BANK ---
    const bankService = await prisma.service.findUnique({ where: { serviceCode: Number(bank_code) } });
    if (!bankService || !bankService.code.toString().startsWith('BANK_')) {
      return NextResponse.json({ status: false, error: 'Invalid Bank Code' }, { status: 404 });
    }
    if (!bankService.isActive) {
      return NextResponse.json({ status: false, error: `Service Unavailable for ${bankService.name.replace('Bank: ', '')}` }, { status: 503 });
    }

    // --- 4. VALIDATE SERVICE TYPE & PHONE ---
    const modService = await prisma.service.findUnique({ where: { serviceCode: Number(service_code) } });
    if (!modService || !modService.isActive || !modService.code.toString().startsWith('BVN_MOD_')) {
      return NextResponse.json({ status: false, error: 'Invalid Modification Service Code' }, { status: 404 });
    }

    const code = modService.code.toString(); // e.g., BVN_MOD_PHONE

    // If Service involves PHONE, require new_phone_number
    const phoneCategories = ['BVN_MOD_PHONE', 'BVN_MOD_NAME_PHONE', 'BVN_MOD_DOB_PHONE', 'BVN_MOD_FULL'];
    if (phoneCategories.includes(code) && !new_phone_number) {
        return NextResponse.json({ status: false, error: 'New Phone Number is required for this service category.' }, { status: 400 });
    }

    // --- 5. AUTOMATIC SURCHARGE CALCULATION ---
    let finalCost = Number(modService.price);
    let surchargeApplied = false;

    // We check the date gap regardless of service type, but usually it applies when DOB is changing.
    // Logic: If the Old DOB and New DOB are different AND the gap is > 5 years, apply surcharge.
    if (old_details.dob !== new_details.dob) {
        const yearsDiff = getYearDifference(old_details.dob, new_details.dob);
        if (yearsDiff > SURCHARGE_THRESHOLD_YEARS) {
            finalCost += SURCHARGE_AMOUNT;
            surchargeApplied = true;
        }
    }

    // --- 6. CHECK WALLET ---
    if (Number(user.walletBalance) < finalCost) {
      return NextResponse.json({ 
          status: false, 
          error: `Insufficient funds. Total Cost: ₦${finalCost.toLocaleString()} ${surchargeApplied ? '(Includes Major Correction Surcharge)' : ''}` 
      }, { status: 402 });
    }

    // --- 7. PROCESS & LOG ---
    const requestLog = await prisma.$transaction(async (tx) => {
      // Deduct
      await tx.user.update({ where: { id: user.id }, data: { walletBalance: { decrement: finalCost } } });
      
      // Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: modService.code,
          status: 'PROCESSING',
          cost: finalCost,
          requestData: {
            bank_name: bankService.name.replace('Bank: ', ''),
            nin, 
            bvn,
            old_details, 
            new_details, 
            new_phone_number,
            clientReference: reference,
            surcharge_applied: surchargeApplied
          },
          adminNote: surchargeApplied ? 'Age Surcharge Applied (>5 years)' : 'Pending Modification'
        }
      });
    });

    // --- 8. SUCCESS RESPONSE ---
    return NextResponse.json({
      status: true,
      message: 'Modification Request Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: finalCost,
        note: surchargeApplied ? 'Includes surcharge for major age correction' : 'Standard processing fee applied'
      }
    });

  } catch (error) {
    console.error("BVN Mod Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
