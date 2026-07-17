import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Helper to get user ID
async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key-change-me');
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

// GET: Fetch Keys, Webhook, and Access Status
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      apiKeyPublic: true, 
      apiKeySecret: true, 
      webhookUrl: true,
      apiStatus: true, // Matches your DB schema
      businessName: true,
      websiteUrl: true   // Matches your DB schema
    }
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // SECURITY: If not approved, completely hide the keys from the frontend payload
  if (user.apiStatus !== 'APPROVED') {
    return NextResponse.json({
      apiStatus: user.apiStatus || 'NONE',
      businessName: user.businessName,
      websiteUrl: user.websiteUrl,
      webhookUrl: null,
      apiKeyPublic: null,
      apiKeySecret: null
    });
  }

  return NextResponse.json(user);
}

// POST: Handles BOTH Initial Request submission and Approved Key Rotation
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const { action, businessName, websiteUrl } = body;

    // CASE A: Submitting a completely new request
    if (action === 'SUBMIT_REQUEST') {
      if (!businessName || !websiteUrl) {
        return NextResponse.json({ error: 'Business Name and Website URL are required' }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          businessName,
          websiteUrl,        // Syncs with DB
          apiStatus: 'PENDING' // Syncs with DB Enum
        }
      });

      return NextResponse.json({ 
        status: true, 
        apiStatus: 'PENDING',
        businessName: updatedUser.businessName,
        websiteUrl: updatedUser.websiteUrl
      });
    }

    // CASE B: Standard Live Key Rotation (Only works if already APPROVED)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { apiStatus: true } });
    if (!user || user.apiStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'API Access not approved yet' }, { status: 403 });
    }

    const newPublic = 'pk_live_' + crypto.randomBytes(12).toString('hex');
    const newSecret = 'sk_live_' + crypto.randomBytes(24).toString('hex');

    await prisma.user.update({
      where: { id: userId },
      data: { apiKeyPublic: newPublic, apiKeySecret: newSecret }
    });

    return NextResponse.json({ apiKeyPublic: newPublic, apiKeySecret: newSecret });

  } catch (error) {
    console.error("Credentials POST Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update Webhook URL
export async function PATCH(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ensure they are approved before adding webhooks
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { apiStatus: true } });
    if (!user || user.apiStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'API Access not approved' }, { status: 403 });
    }

    const body = await req.json();
    const { webhookUrl } = body;

    if (webhookUrl && webhookUrl.trim() !== '') {
      if (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
        return NextResponse.json(
          { error: 'Invalid URL. It must start with http:// or https://' }, 
          { status: 400 }
        );
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { webhookUrl: webhookUrl || null }
    });

    return NextResponse.json({ message: 'Webhook updated successfully' });
  } catch (error) {
    console.error("Webhook Update Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
