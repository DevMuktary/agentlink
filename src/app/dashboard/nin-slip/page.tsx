import prisma from '@/lib/prisma';
import NinSlipClient from './ClientForm';

export default async function NinSlipPage() {
  // Fetch the 3 slip generation services
  const services = await prisma.service.findMany({
    where: {
      serviceCode: {
        in: [401, 402, 403]
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

  return <NinSlipClient services={safeServices} />;
}
