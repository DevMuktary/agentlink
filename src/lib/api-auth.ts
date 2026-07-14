import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

// Renamed back to validateApiKey to perfectly match your 49 existing route files
// Added req?: Request to accept the parameter that the old files pass in
export async function validateApiKey(req?: Request) {
  const headersList = await headers();
  const origin = headersList.get('x-request-origin');

  // ==========================================
  // 1. HANDLE EXTERNAL API KEY REQUESTS
  // ==========================================
  if (origin === 'api') {
    // Extract API key from either x-api-key or Authorization Bearer header
    const apiKey = headersList.get('x-api-key') || headersList.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      throw new Error('API_KEY_MISSING');
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { apiKeySecret: apiKey },
          { apiKeyPublic: apiKey }
        ]
      }
    });

    if (!user) {
      throw new Error('INVALID_API_KEY');
    }

    // --- THE CRITICAL SECURITY LOCK ---
    // If they bypass the dashboard and try to use API keys without approval, block them.
    if (user.apiStatus !== 'APPROVED') {
      throw new Error('API_ACCESS_DENIED_OR_PENDING');
    }

    if (!user.isActive) {
      throw new Error('ACCOUNT_SUSPENDED');
    }

    return user;
  }

  // ==========================================
  // 2. HANDLE DASHBOARD BROWSER REQUESTS
  // ==========================================
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new Error('ACCOUNT_SUSPENDED');
    }

    return user;
  } catch (error) {
    throw new Error('INVALID_SESSION_TOKEN');
  }
}
