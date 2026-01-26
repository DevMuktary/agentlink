import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByPhone } from '@/services/providers/robost-phone';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ status: false, error: 'Invalid JSON body' }, { status: 400 });
    }
    
    // FIX 1: Normalize input to 'phone'
    const phone = body.phone || body.phone_number;
    
    // FIX 2: Specific Error Messages
    if (!phone) {
        return NextResponse.json({ 
            status: false, 
            error: "Missing parameter: Please provide 'phone' or 'phone_number'" 
        }, { status: 400 });
    }

    if (String(phone).length < 10) {
        return NextResponse.json({ 
            status: false, 
            error: `Invalid format: Phone number '${phone}' is too short. Must be at least 10 digits.` 
        }, { status: 400 });
    }
    
    // Auto-generate reference if missing
    const reference = body.reference || `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // 3. Get Price
    const service = await prisma.service.findUnique({ where: { code: 'NIN_SEARCH_BY_PHONE' } });
    const serviceCost = service ? Number(service.price) : 150;
    
    if (service && !service.isActive) {
        return NextResponse.json({ status: false, error: 'Service unavailable' }, { status: 503 });
    }

    // 4. Check Balance
    if (Number(user.walletBalance) < serviceCost) {
      return NextResponse.json({ status: false, error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // 5. Deduct & Log (PROCESSING)
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({ where: { id: user.id }, data: { walletBalance: { decrement: serviceCost } } });
      
      // B. Create Transaction
      await tx.transaction.create({
        data: {
            userId: user.id,
            amount: serviceCost,
            type: 'SERVICE_CHARGE',
            status: 'COMPLETED',
            reference: reference,
            description: `NIN Search by Phone: ${phone}`,
            serviceId: 'NIN_SEARCH_BY_PHONE'
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: 'NIN_SEARCH_BY_PHONE',
          status: 'PROCESSING',
          cost: serviceCost, 
          requestData: { phone, clientReference: reference }, 
        }
      });
    });

    // 6. Call Provider
    const result = await lookupNinByPhone(phone);

    if (result.success) {
      // SUCCESS
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { status: 'COMPLETED', responseData: result.data }
      });
      return NextResponse.json({ status: true, message: 'Success', data: result.data });
    } else {
      // REFUND ON FAILURE
      await prisma.$transaction(async (tx) => {
         await tx.user.update({ where: { id: user.id }, data: { walletBalance: { increment: serviceCost } } });
         
         await tx.transaction.create({
            data: {
                userId: user.id,
                amount: serviceCost,
                type: 'REFUND',
                status: 'COMPLETED',
                reference: `${reference}-REFUND`,
                description: `Refund: NIN Phone Search Failed (${phone})`,
                serviceId: 'NIN_SEARCH_BY_PHONE'
            }
         });

         await tx.serviceRequest.update({ 
             where: { id: requestLog.id }, 
             data: { status: 'FAILED', responseData: { error: result.error } } 
         });
      });
      
      // Return the specific provider error if available, or a generic one
      return NextResponse.json({ 
          status: false, 
          error: result.error || "NIN not found for this number", 
          message: 'Refunded' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Phone Verify Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
