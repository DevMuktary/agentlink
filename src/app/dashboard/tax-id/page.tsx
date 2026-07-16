import prisma from '@/lib/prisma';
import TaxIdClient from './ClientForm';

export default async function TaxIdPage() {
  // Fetch both Individual and Corporate Tax ID services
  const services = await prisma.service.findMany({
    where: {
      code: {
        in: ['TAX_ID_INDIVIDUAL', 'TAX_ID_NON_INDIVIDUAL']
      }
    }
  });

  // Serialize the data safely for the Client Component
  const safeServices = services.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    serviceCode: s.serviceCode || 0,
    isActive: s.isActive,
    price: Number(s.price || 0)
  }));

  return <TaxIdClient services={safeServices} />;
}
