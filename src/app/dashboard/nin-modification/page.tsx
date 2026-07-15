import prisma from '@/lib/prisma';
import NinModificationClient from './ClientForm';

export default async function NinModificationPage() {
  // Fetch only the 3 NIN Modification services
  const services = await prisma.service.findMany({
    where: {
      code: {
        in: [
          'NIN_MODIFICATION_NAME', 
          'NIN_MODIFICATION_PHONE', 
          'NIN_MODIFICATION_ADDRESS'
        ]
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

  return <NinModificationClient services={safeServices} />;
}
