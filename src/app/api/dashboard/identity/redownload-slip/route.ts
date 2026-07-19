import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { generateNinSlipPdf } from '@/services/pdf-generator';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { request_id } = await req.json();
    if (!request_id) return NextResponse.json({ status: false, error: 'Request ID required' }, { status: 400 });

    // 1. Find the specific completed transaction
    const slipRequest = await prisma.serviceRequest.findFirst({
      where: { 
        id: request_id,
        userId: user.id,
        status: 'COMPLETED'
      }
    });

    if (!slipRequest || !slipRequest.responseData) {
      return NextResponse.json({ status: false, error: 'Slip record not found or incomplete' }, { status: 404 });
    }

    // 2. Ensure they are only redownloading a Slip record
    const serviceCode = String(slipRequest.serviceType || '');
    if (!serviceCode.includes('NIN_SLIP')) {
      return NextResponse.json({ status: false, error: 'Invalid record type' }, { status: 400 });
    }

    // 3. Guarantee they only get the EXACT slip they paid for
    let templateType = 'regular';
    if (serviceCode.includes('PREMIUM')) templateType = 'premium';
    else if (serviceCode.includes('STANDARD')) templateType = 'standard';
    else if (serviceCode.includes('REGULAR')) templateType = 'regular';

    // 4. Regenerate PDF (Free, no provider call)
    const rawData = slipRequest.responseData as any;
    
    try {
      const pdfBuffer = await generateNinSlipPdf(templateType, rawData);
      const pdfBase64 = pdfBuffer.toString('base64');

      return NextResponse.json({
        status: true,
        message: 'Slip Regenerated',
        pdf_base64: pdfBase64,
        template_used: templateType
      });
    } catch (pdfError) {
      console.error("Redownload PDF Error:", pdfError);
      return NextResponse.json({ status: false, error: 'Failed to reconstruct PDF from archive.' }, { status: 500 });
    }

  } catch (error) {
    console.error("Redownload Route Error:", error);
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
