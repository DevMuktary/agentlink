import prisma from '@/lib/prisma';

export async function validateApiKey(req: Request) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const apiKey = authHeader.split(' ')[1];

  const user = await prisma.user.findUnique({
    where: { apiKeySecret: apiKey },
    select: { id: true, walletBalance: true }
  });

  return user;
}
