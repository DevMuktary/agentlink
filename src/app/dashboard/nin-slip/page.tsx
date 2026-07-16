import prisma from '@/lib/prisma';
import NinSlipClient from './ClientForm';

export default async function NinSlipPage() {
  // Fetch all V2 Slip Services (Both NIN and Phone versions)
  const services = await prisma.service.findMany({
    where: {
      code: {
        startsWith: 'NIN_SLIP_V2'
      }
    }
  });

  // Serialize the data safely for the Client Component
  const safeServices = services.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    isActive: s.isActive,
    price: Number(s.price || 0)
  }));

  return <NinSlipClient services={safeServices} />;
}
