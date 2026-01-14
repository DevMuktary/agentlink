import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { 
      reference,
      ticket_id,
      full_name,
      nin,
      bvn
    } = body;

    // 2. Validate Inputs
    if (!reference) return NextResponse.json({ status: false, error: 'Missing reference' }, { status: 400 });
    
    const missing = [];
    if (!ticket_id) missing.push('ticket_id');
    if (!full_name) missing.push('full_name');
    if (!nin) missing.push('nin');
    if (!bvn) missing.push('bvn');

    if (missing.length > 0) {
      return NextResponse.json({ status: false, error: `Missing Fields: ${missing.join(', ')}` }, { status: 400 });
    }

    if (nin.length !== 11) return NextResponse.json({ status: false, error: 'Invalid NIN (11 digits)' }, { status: 400 });
    if (bvn.length !== 11) return NextResponse.json({ status: false, error: 'Invalid BVN (11 digits)' }, { status: 400 });

    // 3. Get Price
    const service = await prisma.service.findUnique({ where: { code: 'VNIN_TO_NIBSS' } });
    if (!service || !service.isActive) return NextResponse.json({ status: false, error: 'Service Unavailable' }, { status: 503 });

    const cost = Number(service.price);

    // 4. Check Balance
    if (Number(user.walletBalance) < cost) {
      return NextResponse.json({ status: false, error: 'Insufficient funds' }, { status: 402 });
    }

    // 5. Process Transaction
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
          serviceType: 'VNIN_TO_NIBSS',
          status: 'PROCESSING',
          cost: cost,
          requestData: {
            clientReference: reference,
            ticket_id,
            full_name,
            nin,
            bvn
          },
          adminNote: 'Pending NIBSS Submission'
        }
      });
    });

    // 6. Success Response
    return NextResponse.json({
      status: true,
      message: 'Request Submitted Successfully',
      data: {
        request_id: requestLog.id,
        reference: reference,
        status: 'PROCESSING',
        charged_amount: cost,
        note: 'Admin will process the submission to NIBSS.'
      }
    });

  } catch (error) {
    console.error("VNIN-NIBSS Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
