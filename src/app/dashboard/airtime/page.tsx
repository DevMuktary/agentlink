import prisma from '@/lib/prisma';
import AirtimeClient from './ClientForm';

export default async function AirtimePage() {
  // Fetch Airtime Services to get the discount rates
  const services = await prisma.service.findMany({
    where: {
      code: {
        in: ['AIRTIME_MTN', 'AIRTIME_GLO', 'AIRTIME_AIRTEL', 'AIRTIME_9MOBILE']
      }
    }
  });

  // Serialize the data safely for the Client Component
  const safeServices = services.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    isActive: s.isActive,
    price: Number(s.price || 100) // The price field here acts as the percentage rate (e.g., 99 for MTN)
  }));

  return <AirtimeClient services={safeServices} />;
}
