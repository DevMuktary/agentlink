import prisma from '@/lib/prisma';
import BvnModificationClient from './ClientForm';

export default async function BvnModificationPage() {
  // Fetch all active services to separate Banks from Modification Types
  const allServices = await prisma.service.findMany({
    where: { isActive: true }
  });

  // Dynamically separate banks from modification services
  const bankServices = allServices
    .filter(s => s.name.toLowerCase().includes('bank') || s.code.includes('BANK'))
    .map(s => ({
      id: s.id, name: s.name, code: s.code, serviceCode: s.serviceCode || 0, price: Number(s.price || 0)
    }));

  const modServices = allServices
    .filter(s => s.code.includes('BVN_MODIFICATION'))
    .map(s => ({
      id: s.id, name: s.name, code: s.code, serviceCode: s.serviceCode || 0, price: Number(s.price || 0)
    }));

  return <BvnModificationClient bankServices={bankServices} modServices={modServices} />;
}
