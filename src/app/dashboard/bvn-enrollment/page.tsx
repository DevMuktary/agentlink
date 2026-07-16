import prisma from '@/lib/prisma';
import BvnEnrollmentClient from './ClientForm';

export default async function BvnEnrollmentPage() {
  // Fetch the BVN Enrollment service details securely
  const service = await prisma.service.findUnique({
    where: { code: 'ANDROID_BVN_ENROLLMENT' }
  });

  // Serialize the data safely for the Client Component
  const safeService = service ? {
    id: service.id,
    name: service.name,
    code: service.code,
    isActive: service.isActive,
    price: Number(service.price || 0)
  } : null;

  return <BvnEnrollmentClient service={safeService} />;
}
