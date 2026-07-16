import prisma from '@/lib/prisma';
import BvnModificationClient from './ClientForm';

export default async function BvnModificationPage() {
  // Fetch all active services
  const allServices = await prisma.service.findMany({
    where: { isActive: true }
  });

  // Exactly match the seed codes: BVN_MOD_NAME, BVN_MOD_DOB, etc.
  const modServices = allServices
    .filter(s => s.code.startsWith('BVN_MOD_'))
    .map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      serviceCode: s.serviceCode || 0,
      price: Number(s.price || 0)
    }));

  // Match the seed bank names that start with "Bank: "
  const banks = allServices
    .filter(s => s.name.startsWith('Bank: ') || s.code.startsWith('BANK_'))
    .map(s => ({
      id: s.id,
      name: s.name.replace('Bank: ', ''), // Clean up "Bank: " for the UI dropdown
      code: s.code,
      serviceCode: s.serviceCode || 0,
      price: 0 
    }));

  return <BvnModificationClient modServices={modServices} banks={banks} />;
}
