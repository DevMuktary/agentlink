import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function validateApiKey(req: Request) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const apiKey = authHeader.split(' ')[1];

  // Check if it's a Public or Secret key
  // For Admin actions, we generally expect the Secret Key or a Session, 
  // but for this API-centric build, we validate the key attached to the user.
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { apiKeySecret: apiKey },
        { apiKeyPublic: apiKey } // Depending on your security model, mostly Secret is for backend
      ]
    },
    select: {
      id: true,
      walletBalance: true,
      role: true, // <--- ADDED THIS TO FIX THE BUILD ERROR
      email: true
    }
  });

  return user;
}
