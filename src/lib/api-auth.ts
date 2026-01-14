import { headers, cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-admin-key';

export async function validateApiKey(req: Request) {
  const headersList = await headers();
  const cookieStore = await cookies();
  
  let userId: string | null = null;

  // 1. CHECK FOR JWT IN COOKIE (Browser/Dashboard Access)
  const tokenCookie = cookieStore.get('token');
  if (tokenCookie) {
    try {
      const decoded: any = jwt.verify(tokenCookie.value, JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {
      // Invalid token cookie
    }
  }

  // 2. CHECK FOR BEARER TOKEN IN HEADER (API Access)
  const authHeader = headersList.get('authorization');
  if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
        // Try decoding as JWT first
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
    } catch (e) {
        // If not JWT, assume it's an API Key (Public/Secret)
        const apiKeyUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { apiKeySecret: token },
                    { apiKeyPublic: token }
                ]
            },
            select: { id: true }
        });
        if (apiKeyUser) userId = apiKeyUser.id;
    }
  }

  // 3. RETURN USER IF FOUND
  if (userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,          // Essential for Admin Checks
        walletBalance: true, // Essential for Transactions
        businessName: true
      }
    });
  }

  return null;
}
