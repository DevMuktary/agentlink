import prisma from '@/lib/prisma';
import VninToNibssClient from './ClientForm';

export default async function VninToNibssPage() {
  // Fetch the VNIN to NIBSS service details securely
  const service = await prisma.service.findUnique({
    where: { code: 'VNIN_TO_NIBSS' }
  });

  // Serialize the data safely for the Client Component
  const safeService = service ? {
    id: service.id,
    name: service.name,
    code: service.code,
    isActive: service.isActive,
    price: Number(service.price || 0)
  } : null;

  return <VninToNibssClient service={safeService} />;
}
