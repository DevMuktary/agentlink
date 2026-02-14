import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

// --- CONFIGURATION ---
const SURCHARGE_THRESHOLD_YEARS = 5;
const SURCHARGE_AMOUNT = 4000.00;

// Helper: Calculate Date Difference
function getYearDifference(date1: string, date2: string): number {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365)); 
}

export async function POST(req: Request) {
  try {
    // 1. SECURITY
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { 
      service_code, bank_code, reference, nin, bvn, 
      // Identity Fields (Required for ALL)
      old_first_name, old_surname, old_middle_name, // Middle Name is now optional
      // Change Fields (Required based on Service)
      old_dob, new_dob,
      old_phone_number, new_phone_number,
      new_first_name, new_surname, new_middle_name // Middle Name is now optional
    } = body;

    // 2. GLOBAL VALIDATION
    const missing = [];
    if (!service_code) missing.push('service_code');
    if (!bank_code) missing.push('bank_code');
    if (!reference) missing.push('reference');
    if (!nin) missing.push('nin');
    if (!bvn) missing.push('bvn');
    
    // Enforce Identity (First & Last only)
    if (!old_first_name) missing.push('old_first_name');
    if (!old_surname) missing.push('old_surname');
    // REMOVED: if (!old_middle_name) missing.push('old_middle_name'); 

    if (missing.length > 0) {
        return NextResponse.json({ status: false, error: `Missing Identity Fields: ${missing.join(', ')}` }, { status: 400 });
    }

    // 3. SERVICE LOOKUP
    const bankService = await prisma.service.findUnique({ where: { serviceCode: Number(bank_code) } });
    if (!bankService || !bankService.isActive) return NextResponse.json({ status: false, error: 'Invalid Bank Code' }, { status: 400 });

    const modService = await prisma.service.findUnique({ where: { serviceCode: Number(service_code) } });
    if (!modService || !modService.isActive) return NextResponse.json({ status: false, error: 'Invalid Service Code' }, { status: 400 });

    const code = modService.code.toString();
    const specificErrors: string[] = [];

    // 4. SPECIFIC VALIDATION (Based on what is changing)
    
    // If Changing Name -> Require NEW First & Surname only
    if (code.includes('NAME') || code.includes('FULL')) {
        if (!new_first_name || !new_surname) {
            specificErrors.push('new_first_name, new_surname');
        }
    }

    // If Changing DOB -> Require Dates
    if (code.includes('DOB') || code.includes('FULL')) {
        if (!old_dob) specificErrors.push('old_dob');
        if (!new_dob) specificErrors.push('new_dob');
    }

    // If Changing Phone -> Require New Phone
    if (code.includes('PHONE') || code.includes('FULL')) {
        if (!new_phone_number) specificErrors.push('new_phone_number');
    }

    if (specificErrors.length > 0) {
        return NextResponse.json({ status: false, error: `Missing Change Fields: ${specificErrors.join(', ')}` }, { status: 400 });
    }

    // 5. PRICING & SURCHARGE
    let finalCost = Number(modService.price);
    let surchargeApplied = false;

    // Only apply surcharge logic if dates are actually provided
    if ((code.includes('DOB') || code.includes('FULL')) && old_dob && new_dob) {
        const yearsDiff = getYearDifference(old_dob, new_dob);
        if (yearsDiff > SURCHARGE_THRESHOLD_YEARS) {
            finalCost += SURCHARGE_AMOUNT;
            surchargeApplied = true;
        }
    }

    // 6. CHECK BALANCE
    if (Number(user.walletBalance) < finalCost) {
      return NextResponse.json({ 
          status: false, 
          error: `Insufficient funds. Cost: ₦${finalCost.toLocaleString()} ${surchargeApplied ? '(Includes Age Correction Surcharge)' : ''}` 
      }, { status: 402 });
    }

    // 7. EXECUTE TRANSACTION
    const requestLog = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: finalCost } }
      });

      await tx.transaction.create({
        data: {
            userId: user.id,
            amount: finalCost,
            type: 'SERVICE_CHARGE',
            status: 'COMPLETED',
            reference: reference, 
            description: `BVN Mod: ${modService.name}`,
            serviceId: modService.code.toString()
        }
      });

      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: modService.code as any,
          status: 'PROCESSING',
          cost: finalCost,
          requestData: {
            bank_name: bankService.name.replace('Bank: ', ''),
            nin, bvn, clientReference: reference,
            surcharge_applied: surchargeApplied,
            // Store Identity Cleanly (Middle name defaults to empty string if missing)
            identity: { 
                first_name: old_first_name, 
                surname: old_surname, 
                middle_name: old_middle_name || '' 
            },
            // Store Change Data
            changes: { 
                new_name: (code.includes('NAME') || code.includes('FULL')) 
                    ? { first: new_first_name, last: new_surname, middle: new_middle_name || '' } 
                    : null,
                dates: (code.includes('DOB') || code.includes('FULL')) 
                    ? { old: old_dob, new: new_dob } 
                    : null,
                phone: (code.includes('PHONE') || code.includes('FULL'))
                    ? { old: old_phone_number, new: new_phone_number } 
                    : null
            }
          },
          adminNote: surchargeApplied ? 'Age Surcharge Applied' : 'Pending Modification'
        }
      });
    });

    // 8. RESPONSE
    return NextResponse.json({
      status: true,
      message: 'Modification Request Submitted',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: finalCost,
        bank: bankService.name.replace('Bank: ', ''),
        note: surchargeApplied ? 'Includes surcharge for major age correction' : undefined
      }
    });

  } catch (error) {
    console.error("BVN Mod API Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
