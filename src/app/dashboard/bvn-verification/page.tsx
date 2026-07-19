import prisma from '@/lib/prisma';
import BvnVerificationClient from './ClientForm';

export default async function BvnVerificationPage() {
  // Fetch the BVN Verification Service
  const service = await prisma.service.findUnique({
    where: {
      code: 'BVN_VERIFICATION'
    }
  });

  // Serialize the data safely for the Client Component
  const safeService = service ? {
    id: service.id,
    name: service.name,
    code: service.code,
    isActive: service.isActive,
    price: Number(service.price || 0)
  } : null;

  return <BvnVerificationClient service={safeService} />;
}
