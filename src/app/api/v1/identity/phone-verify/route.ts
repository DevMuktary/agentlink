import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { lookupNinByPhone } from '@/services/providers/robost-phone';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    
    // FIX 1: Accept 'phone' OR 'phone_number'
    const phone = body.phone || body.phone_number;
    
    // FIX 2: Make Reference Optional (Auto-generate if missing)
    const reference = body.reference || `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // 2. Validate Inputs
    if (!phone || phone.length < 10) {
        return NextResponse.json({ status: false, error: 'Invalid Phone Number' }, { status: 400 });
    }

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
      
      // B. Create Transaction Record
      await tx.transaction.create({
        data: {
            userId: user.id,
            amount: serviceCost,
            type: 'SERVICE_CHARGE',
            status: 'COMPLETED',
            reference: reference, // Guaranteed to exist now
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
         // A. Refund Wallet
         await tx.user.update({ where: { id: user.id }, data: { walletBalance: { increment: serviceCost } } });
         
         // B. Log Refund Transaction
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

         // C. Update Request
         await tx.serviceRequest.update({ 
             where: { id: requestLog.id }, 
             data: { status: 'FAILED', responseData: { error: result.error } } 
         });
      });
      
      return NextResponse.json({ status: false, error: result.error, message: 'Refunded' }, { status: 400 });
    }

  } catch (error) {
    console.error("Phone Verify Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
