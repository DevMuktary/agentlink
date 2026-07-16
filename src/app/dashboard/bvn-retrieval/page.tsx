import prisma from '@/lib/prisma';
import BvnRetrievalClient from './ClientForm';

export default async function BvnRetrievalPage() {
  // Fetch only the BVN Retrieval services
  const services = await prisma.service.findMany({
    where: {
      code: {
        in: ['BVN_RETRIEVAL_PHONE', 'BVN_RETRIEVAL_CRM']
      }
    }
  });

  // Serialize the data safely
  const safeServices = services.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    serviceCode: s.serviceCode || 0,
    isActive: s.isActive,
    price: Number(s.price || 0)
  }));

  return <BvnRetrievalClient services={safeServices} />;
}
