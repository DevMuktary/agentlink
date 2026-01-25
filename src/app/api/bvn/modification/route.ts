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
    // 1. SECURITY: Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    const body = await req.json();
    const { 
      service_code,        
      bank_code,           
      reference, 
      nin, 
      bvn, 
      old_details, // Object
      new_details, // Object
      new_phone_number 
    } = body;

    // --- 2. GLOBAL VALIDATION (Required for ALL types) ---
    const missingGlobal = [];
    if (!service_code) missingGlobal.push('service_code');
    if (!bank_code) missingGlobal.push('bank_code');
    if (!reference) missingGlobal.push('reference');
    if (!nin) missingGlobal.push('nin');
    if (!bvn) missingGlobal.push('bvn');
    if (!old_details) missingGlobal.push('old_details');
    if (!new_details) missingGlobal.push('new_details');

    if (missingGlobal.length > 0) {
        return NextResponse.json({ status: false, error: `Missing Top-Level Fields: ${missingGlobal.join(', ')}` }, { status: 400 });
    }

    // --- 3. IDENTIFY SERVICE & BANK ---
    const bankService = await prisma.service.findUnique({ where: { serviceCode: Number(bank_code) } });
    if (!bankService || !bankService.isActive) return NextResponse.json({ status: false, error: 'Invalid or Inactive Bank Code' }, { status: 400 });

    const modService = await prisma.service.findUnique({ where: { serviceCode: Number(service_code) } });
    if (!modService || !modService.isActive) return NextResponse.json({ status: false, error: 'Invalid or Inactive Modification Service Code' }, { status: 400 });

    const code = modService.code.toString();
    const errors: string[] = [];

    // --- 4. STRICT PER-CATEGORY VALIDATION ---
    
    // HELPER: Validate Basic Identity (First, Surname, Middle, DOB)
    const validateIdentity = (details: any, prefix: string) => {
        if (!details.first_name) errors.push(`${prefix}.first_name`);
        if (!details.surname) errors.push(`${prefix}.surname`);
        if (!details.middle_name) errors.push(`${prefix}.middle_name`);
        if (!details.dob) errors.push(`${prefix}.dob`);
    };

    switch (code) {
        // --- GROUP A: NAME or DOB ONLY (No Phone) ---
        case 'BVN_MOD_NAME':  // 620
        case 'BVN_MOD_DOB':   // 621
            validateIdentity(old_details, 'old_details');
            validateIdentity(new_details, 'new_details');
            // We explicitly DO NOT check for phone numbers here
            break;

        // --- GROUP B: PHONE ONLY ---
        case 'BVN_MOD_PHONE': // 622
            validateIdentity(old_details, 'old_details');
            validateIdentity(new_details, 'new_details');
            
            // Phone Specifics
            if (!old_details.phone_number) errors.push('old_details.phone_number');
            if (!new_phone_number) errors.push('new_phone_number');
            break;

        // --- GROUP C: COMBINATIONS (Name+Phone, DOB+Phone, Full) ---
        case 'BVN_MOD_NAME_PHONE': // 623
        case 'BVN_MOD_DOB_PHONE':  // 624
        case 'BVN_MOD_FULL':       // 625
            validateIdentity(old_details, 'old_details');
            validateIdentity(new_details, 'new_details');
            
            // Phone Specifics
            if (!old_details.phone_number) errors.push('old_details.phone_number');
            if (!new_phone_number) errors.push('new_phone_number');
            break;

        default:
            return NextResponse.json({ status: false, error: `Service Code ${code} is not implemented yet.` }, { status: 501 });
    }

    if (errors.length > 0) {
        return NextResponse.json({ status: false, error: `Missing Fields for ${modService.name}: ${errors.join(', ')}` }, { status: 400 });
    }

    // --- 5. PRICING & SURCHARGE ---
    let finalCost = Number(modService.price);
    let surchargeApplied = false;

    // Surcharge Logic: If DOB is changing AND gap > 5 years
    if (old_details.dob !== new_details.dob) {
        const yearsDiff = getYearDifference(old_details.dob, new_details.dob);
        if (yearsDiff > SURCHARGE_THRESHOLD_YEARS) {
            finalCost += SURCHARGE_AMOUNT;
            surchargeApplied = true;
        }
    }

    // --- 6. CHECK BALANCE ---
    if (Number(user.walletBalance) < finalCost) {
      return NextResponse.json({ 
          status: false, 
          error: `Insufficient funds. Cost: ₦${finalCost.toLocaleString()} ${surchargeApplied ? '(Includes Major Age Correction Surcharge)' : ''}` 
      }, { status: 402 });
    }

    // --- 7. TRANSACTION EXECUTION ---
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: finalCost } }
      });

      // B. Log Transaction (History)
      await tx.transaction.create({
        data: {
            userId: user.id,
            amount: finalCost,
            type: 'SERVICE_CHARGE',
            status: 'COMPLETED',
            reference: reference, 
            description: `BVN Mod: ${modService.name}${surchargeApplied ? ' (+ Age Surcharge)' : ''}`,
            serviceId: modService.code.toString()
        }
      });

      // C. Create Request
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
            
            // Validated Data
            old_details: {
                ...old_details, // Includes phone if passed
                phone_number: old_details.phone_number || null // Ensure explicit null if undefined
            },
            new_details: {
                ...new_details
            },
            new_phone_number: new_phone_number || null,

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
        bank: bankService.name.replace('Bank: ', ''),
        service: modService.name,
        note: surchargeApplied ? 'Includes surcharge for major age correction' : undefined
      }
    });

  } catch (error) {
    console.error("BVN Mod API Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error processing request' }, { status: 500 });
  }
}
