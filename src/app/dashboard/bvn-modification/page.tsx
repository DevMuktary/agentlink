import prisma from '@/lib/prisma';
import BvnModificationClient from './ClientForm';

export default async function BvnModificationPage() {
  // Fetch all active services to filter banks and mod services
  const allServices = await prisma.service.findMany({
    where: { isActive: true }
  });

  // Extract Modification Services (e.g., BVN_MODIFICATION_NAME)
  const modServices = allServices
    .filter(s => s.code.includes('BVN_MODIFICATION'))
    .map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      serviceCode: s.serviceCode || 0,
      price: Number(s.price || 0)
    }));

  // Extract Banks (Backend expects bank names to start with "Bank: ")
  const banks = allServices
    .filter(s => s.name.startsWith('Bank: ') || s.code.startsWith('BANK_'))
    .map(s => ({
      id: s.id,
      name: s.name.replace('Bank: ', ''), // Clean up name for UI
      code: s.code,
      serviceCode: s.serviceCode || 0,
      price: 0 // Banks don't have their own price in this context
    }));

  return <BvnModificationClient modServices={modServices} banks={banks} />;
}
