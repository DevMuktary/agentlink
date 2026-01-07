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
  // Return 0 if invalid dates (Validation handles the error later)
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365)); 
}

export async function POST(req: Request) {
  try {
    // 1. SECURITY: Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });

    // 2. DATA EXTRACTION: Explicitly Destructure Everything
    // This makes it clear what fields we expect from the JSON body
    const body = await req.json();
    const { 
      service_code,       
      bank_code,          
      reference, 
      nin, 
      bvn, 
      old_details, // We expect this to be an object
      new_details, // We expect this to be an object
      new_phone_number 
    } = body;

    // --- 3. LEVEL 1 VALIDATION: Basic Identifiers ---
    const missingFields = [];
    if (!service_code) missingFields.push('service_code');
    if (!bank_code) missingFields.push('bank_code');
    if (!reference) missingFields.push('reference');
    if (!nin) missingFields.push('nin');
    if (!bvn) missingFields.push('bvn');
    if (!old_details) missingFields.push('old_details');
    if (!new_details) missingFields.push('new_details');

    if (missingFields.length > 0) {
        return NextResponse.json({ 
            status: false, 
            error: `Missing Required Top-Level Fields: ${missingFields.join(', ')}` 
        }, { status: 400 });
    }

    // Validate Lengths
    if (String(nin).length !== 11) return NextResponse.json({ status: false, error: 'Invalid NIN: Must be exactly 11 digits' }, { status: 400 });
    if (String(bvn).length !== 11) return NextResponse.json({ status: false, error: 'Invalid BVN: Must be exactly 11 digits' }, { status: 400 });


    // --- 4. LEVEL 2 VALIDATION: EXPLICIT DETAIL FIELDS ---
    // We check every single field inside the objects to ensure "Best Practice" compliance.
    
    // Validate OLD DETAILS (BVN)
    const oldErrors = [];
    if (!old_details.first_name) oldErrors.push('first_name');
    if (!old_details.surname) oldErrors.push('surname');
    if (!old_details.middle_name) oldErrors.push('middle_name');
    if (!old_details.dob) oldErrors.push('dob');

    if (oldErrors.length > 0) {
        return NextResponse.json({ 
            status: false, 
            error: `Missing fields in 'old_details': ${oldErrors.join(', ')}` 
        }, { status: 400 });
    }

    // Validate NEW DETAILS (NIN)
    const newErrors = [];
    if (!new_details.first_name) newErrors.push('first_name');
    if (!new_details.surname) newErrors.push('surname');
    if (!new_details.middle_name) newErrors.push('middle_name');
    if (!new_details.dob) newErrors.push('dob');

    if (newErrors.length > 0) {
        return NextResponse.json({ 
            status: false, 
            error: `Missing fields in 'new_details': ${newErrors.join(', ')}` 
        }, { status: 400 });
    }


    // --- 5. LEVEL 3: VALIDATE CODES & LOGIC ---
    
    // Validate Bank Code
    const bankService = await prisma.service.findUnique({ where: { serviceCode: Number(bank_code) } });
    if (!bankService || !bankService.code.toString().startsWith('BANK_')) {
      return NextResponse.json({ status: false, error: `Invalid Bank Code: ${bank_code}. Please check the documentation.` }, { status: 404 });
    }
    if (!bankService.isActive) {
      return NextResponse.json({ status: false, error: `Service Unavailable for bank: ${bankService.name}` }, { status: 503 });
    }

    // Validate Modification Service Code
    const modService = await prisma.service.findUnique({ where: { serviceCode: Number(service_code) } });
    if (!modService || !modService.isActive || !modService.code.toString().startsWith('BVN_MOD_')) {
      return NextResponse.json({ status: false, error: `Invalid Modification Service Code: ${service_code}` }, { status: 404 });
    }

    // Check Phone Number Requirement
    const code = modService.code.toString();
    const phoneCategories = ['BVN_MOD_PHONE', 'BVN_MOD_NAME_PHONE', 'BVN_MOD_DOB_PHONE', 'BVN_MOD_FULL'];
    
    if (phoneCategories.includes(code)) {
        if (!new_phone_number || String(new_phone_number).length < 10) {
            return NextResponse.json({ 
                status: false, 
                error: 'Field `new_phone_number` is required and valid for this Service Category.' 
            }, { status: 400 });
        }
    }

    // --- 6. PRICING & SURCHARGE LOGIC ---
    let finalCost = Number(modService.price);
    let surchargeApplied = false;

    // Logic: If DOB changed AND gap > 5 years -> Add Surcharge
    if (old_details.dob !== new_details.dob) {
        const yearsDiff = getYearDifference(old_details.dob, new_details.dob);
        if (yearsDiff > SURCHARGE_THRESHOLD_YEARS) {
            finalCost += SURCHARGE_AMOUNT;
            surchargeApplied = true;
        }
    }

    // --- 7. WALLET CHARGE ---
    if (Number(user.walletBalance) < finalCost) {
      return NextResponse.json({ 
          status: false, 
          error: `Insufficient funds. Cost: ₦${finalCost.toLocaleString()} ${surchargeApplied ? '(Includes Major Correction Surcharge)' : ''}` 
      }, { status: 402 });
    }

    // --- 8. EXECUTE TRANSACTION ---
    const requestLog = await prisma.$transaction(async (tx) => {
      // Deduct Balance
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: finalCost } }
      });
      
      // Save Request with STRICT Structure
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
            // We save the validated objects directly
            old_details: {
                first_name: old_details.first_name,
                surname: old_details.surname,
                middle_name: old_details.middle_name,
                dob: old_details.dob
            }, 
            new_details: {
                first_name: new_details.first_name,
                surname: new_details.surname,
                middle_name: new_details.middle_name,
                dob: new_details.dob
            },
            new_phone_number: new_phone_number || null,
            clientReference: reference,
            surcharge_applied: surchargeApplied
          },
          adminNote: surchargeApplied ? 'Age Surcharge Applied (>5 years)' : 'Pending Modification'
        }
      });
    });

    // --- 9. RETURN RESPONSE ---
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
