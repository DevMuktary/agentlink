import prisma from '@/lib/prisma';
import BvnSlipClient from './ClientForm';

export default async function BvnSlipPage() {
  // Fetch the BVN Premium Slip service details securely
  const service = await prisma.service.findUnique({
    where: { code: 'BVN_PREMIUM_SLIP' }
  });

  // Serialize the data safely for the Client Component
  const safeService = service ? {
    id: service.id,
    name: service.name,
    code: service.code,
    isActive: service.isActive,
    price: Number(service.price || 0)
  } : null;

  return <BvnSlipClient service={safeService} />;
}
