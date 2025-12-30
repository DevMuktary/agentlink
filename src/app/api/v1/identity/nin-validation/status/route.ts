import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const user = await validateApiKey(req);
    if (!user) return NextResponse.json({ status: false, error: 'Unauthorized' }, { status: 401 });

    // 2. Get Params (Allow checking by YOUR ID or THEIR reference)
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('request_id');
    const clientRef = searchParams.get('reference');

    if (!requestId && !clientRef) {
      return NextResponse.json({ status: false, error: 'request_id or reference is required' }, { status: 400 });
    }

    // 3. Build Query
    let whereQuery: any = {
        userId: user.id,
        serviceType: { in: ['NIN_VALIDATION_NO_RECORD', 'NIN_VALIDATION_UPDATE_RECORD', 'NIN_VALIDATION_VNIN'] }
    };

    if (requestId) {
        whereQuery.id = requestId;
    } else {
        whereQuery.requestData = { path: ['clientReference'], equals: clientRef };
    }

    // 4. Find Request
    const request = await prisma.serviceRequest.findFirst({
      where: whereQuery,
      select: {
        id: true,
        status: true,
        adminNote: true, // Important: This is where you write rejection reasons
        responseData: true, // This is where you upload the result/file
        updatedAt: true
      }
    });

    if (!request) {
      return NextResponse.json({ status: false, error: 'Request not found' }, { status: 404 });
    }

    // 5. Return Status
    return NextResponse.json({
      status: true,
      current_status: request.status,
      result: request.status === 'COMPLETED' ? request.responseData : null,
      admin_note: request.adminNote, // Show them the note (e.g., "Invalid Details" or "Done")
      last_updated: request.updatedAt
    });

  } catch (error) {
    return NextResponse.json({ status: false, error: 'Server Error' }, { status: 500 });
  }
}
