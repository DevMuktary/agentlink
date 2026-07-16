import prisma from '@/lib/prisma';
import IpeClearanceClient from './ClientForm';

export default async function IpeClearancePage() {
  // Fetch the IPE Clearance service details securely
  const service = await prisma.service.findUnique({
    where: { code: 'IPE_CLEARANCE' }
  });

  // Serialize the data safely for the Client Component
  const safeService = service ? {
    id: service.id,
    name: service.name,
    code: service.code,
    isActive: service.isActive,
    price: Number(service.price || 0)
  } : null;

  return <IpeClearanceClient service={safeService} />;
}
