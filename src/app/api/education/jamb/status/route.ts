import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    const { reference, request_id } = await req.json();

    if (!reference && !request_id) {
        return NextResponse.json({ status: false, error: 'Provide reference or request_id' }, { status: 400 });
    }

    const request = await prisma.serviceRequest.findFirst({
        where: {
            userId: user.id,
            OR: [
                { id: request_id },
                { requestData: { path: ['clientReference'], equals: reference } }
            ]
        }
    });

    if (!request) {
        return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // Return Data
    const responseData: any = request.responseData || {};
    
    return NextResponse.json({
        status: true,
        data: {
            request_id: request.id,
            status: request.status,
            service: request.serviceType,
            cost: request.cost,
            // The Cloudinary URL will be here if completed
            result_url: responseData.resultUrl || null,
            admin_note: request.adminNote,
            date: request.createdAt
        }
    });

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
