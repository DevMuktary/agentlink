import prisma from '@/lib/prisma';
import NinVerificationClient from './ClientForm';

export default async function NinVerificationPage() {
  // Fetch Verification Services
  const verificationServices = await prisma.service.findMany({
    where: {
      code: {
        in: ['NIN_VERIFICATION', 'NIN_SEARCH_BY_PHONE']
      }
    }
  });

  // Fetch Slip Generation Services (V1)
  const slipServices = await prisma.service.findMany({
    where: {
      code: {
        in: ['NIN_SLIP_PREMIUM', 'NIN_SLIP_STANDARD', 'NIN_SLIP_REGULAR']
      }
    }
  });

  // Serialize for Client
  const safeServices = {
    verifications: verificationServices.map(s => ({
      code: s.code,
      name: s.name,
      isActive: s.isActive,
      price: Number(s.price || 0)
    })),
    slips: slipServices.map(s => ({
      code: s.code,
      serviceCode: s.serviceCode,
      name: s.name,
      isActive: s.isActive,
      price: Number(s.price || 0)
    }))
  };

  return <NinVerificationClient services={safeServices} />;
}
