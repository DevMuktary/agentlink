import prisma from '@/lib/prisma';
import NinSlipClient from './ClientForm';

export default async function NinSlipPage() {
  // Fetch all V2 Slip Services using the exact Enum values
  const services = await prisma.service.findMany({
    where: {
      code: {
        in: [
          'NIN_SLIP_V2_PREMIUM',
          'NIN_SLIP_V2_STANDARD',
          'NIN_SLIP_V2_REGULAR',
          'NIN_SLIP_V2_PHONE_PREMIUM',
          'NIN_SLIP_V2_PHONE_STANDARD',
          'NIN_SLIP_V2_PHONE_REGULAR'
        ]
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
