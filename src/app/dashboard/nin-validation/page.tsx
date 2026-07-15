import prisma from '@/lib/prisma';
import NinValidationClient from './ClientForm';

export default async function NinValidationPage() {
  // Fetch only the 3 NIN Validation services
  const services = await prisma.service.findMany({
    where: {
      code: {
        in: [
          'NIN_VALIDATION_NO_RECORD', 
          'NIN_VALIDATION_UPDATE_RECORD', 
          'NIN_VALIDATION_VNIN'
        ]
      }
    }
  });

  // Serialize the data safely for the Client Component
  const safeServices = services.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    serviceCode: s.serviceCode,
    isActive: s.isActive,
    price: Number(s.price || 0) // Automatically utilizes your dynamic dashboard pricing
  }));

  return <NinValidationClient services={safeServices} />;
}
