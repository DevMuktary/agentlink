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

// GET: Fetch Keys & Webhook
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { apiKeyPublic: true, apiKeySecret: true, webhookUrl: true }
  });

  return NextResponse.json(user);
}

// POST: Rotate API Keys
export async function POST() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const newPublic = 'pk_live_' + crypto.randomBytes(12).toString('hex');
  const newSecret = 'sk_live_' + crypto.randomBytes(24).toString('hex');

  await prisma.user.update({
    where: { id: userId },
    data: { apiKeyPublic: newPublic, apiKeySecret: newSecret }
  });

  return NextResponse.json({ apiKeyPublic: newPublic, apiKeySecret: newSecret });
}

// PATCH: Update Webhook URL
export async function PATCH(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { webhookUrl } = body;

    // Validation: Allow empty string (to clear), otherwise must start with http/https
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
      data: { webhookUrl: webhookUrl || null } // Save as null if empty
    });

    return NextResponse.json({ message: 'Webhook updated successfully' });
  } catch (error) {
    console.error("Webhook Update Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
