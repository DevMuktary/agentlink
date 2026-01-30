import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
// Ensure this path matches your provider service file
import { purchaseExamPin, EXAM_PRODUCT_CODES } from '@/services/providers/cheapdata-exam';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { 
      service_type, // Enum: EXAM_PIN_WAEC, EXAM_PIN_NECO, etc.
      quantity, 
      phone_number, 
      reference 
    } = body;

    // 2. Validate Inputs
    // Check against the predefined product codes map
    if (!service_type || !EXAM_PRODUCT_CODES[service_type]) {
      return NextResponse.json({ 
          status: false, 
          error: `Invalid service_type. Available: ${Object.keys(EXAM_PRODUCT_CODES).join(', ')}` 
      }, { status: 400 });
    }
    
    const qty = Number(quantity);
    if (!qty || qty < 1 || qty > 50) {
      return NextResponse.json({ status: false, error: 'Invalid Quantity (1-50)' }, { status: 400 });
    }

    if (!reference) return NextResponse.json({ status: false, error: 'Missing Reference' }, { status: 400 });

    // 3. Get Price from DB
    const service = await prisma.service.findUnique({ where: { code: service_type as any } });
    
    if (!service || !service.isActive) {
      return NextResponse.json({ status: false, error: 'Service Unavailable' }, { status: 503 });
    }

    // 4. Calculate Total Cost
    const unitPrice = Number(service.price);
    const totalCost = unitPrice * qty;

    // 5. Check Balance
    if (Number(user.walletBalance) < totalCost) {
      return NextResponse.json({ status: false, error: `Insufficient funds. Cost: ₦${totalCost}` }, { status: 402 });
    }

    // 6. Deduct & Log (PROCESSING)
    const requestLog = await prisma.$transaction(async (tx) => {
      // A. Deduct
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: totalCost } }
      });

      // B. Create Transaction Record
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: totalCost,
          type: 'SERVICE_CHARGE',
          status: 'COMPLETED',
          reference: reference, 
          description: `Exam Pins: ${qty}x ${service.name}`,
          serviceId: service_type
        }
      });

      // C. Create Request
      return await tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceType: service_type as any, // Cast to enum
          status: 'PROCESSING',
          cost: totalCost,
          requestData: { 
            service_type, 
            quantity: qty, 
            phone_number: phone_number || 'N/A',
            clientReference: reference 
          },
          adminNote: 'Automated Pin Vending'
        }
      });
    });

    // 7. Call Provider
    const productCode = EXAM_PRODUCT_CODES[service_type];
    const result = await purchaseExamPin(productCode, qty, phone_number || '08000000000', reference);

    if (result.success) {
      // SUCCESS: Save PINs to DB & Return
      await prisma.serviceRequest.update({
        where: { id: requestLog.id },
        data: { 
            status: 'COMPLETED', 
            responseData: { pins: result.data.pins } // Ensure consistent structure
        }
      });

      return NextResponse.json({
        status: true,
        message: 'Exam Pins Purchased Successfully',
        data: {
            service: service.name,
            quantity: qty,
            amount: totalCost,
            pins: result.data.pins, // Array of strings or objects { pin, serial }
            reference: reference
        }
      });

    } else {
      // FAILED: Refund
      await prisma.$transaction(async (tx) => {
        // A. Refund Wallet
        await tx.user.update({ 
            where: { id: user.id }, 
            data: { walletBalance: { increment: totalCost } } 
        });

        // B. Log Refund Transaction
        await tx.transaction.create({
            data: {
              userId: user.id,
              amount: totalCost,
              type: 'REFUND',
              status: 'COMPLETED',
              reference: `${reference}-REFUND`, 
              description: `Refund: Exam Pins Failed (${service.name})`,
              serviceId: service_type
            }
        });

        // C. Update Request Status
        await tx.serviceRequest.update({ 
          where: { id: requestLog.id }, 
          data: { status: 'FAILED', responseData: { error: result.error } } 
        });
      });

      return NextResponse.json({ 
        status: false, 
        error: result.error || 'Provider Error', 
        message: 'Transaction Failed - Wallet Refunded' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Exam Pin API Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
