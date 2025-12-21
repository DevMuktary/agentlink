import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Services...');

  const services = [
    {
      code: ServiceType.NIN_VERIFICATION,
      name: 'NIN Verification (By Number)',
      price: 100.00,
      description: 'Verify identity using 11-digit NIN.'
    },
    {
      code: ServiceType.NIN_SEARCH_BY_PHONE,
      name: 'NIN Verification (By Phone)',
      price: 150.00,
      description: 'Retrieve NIN details using Phone Number.'
    },
    // --- NEW SERVICE ADDED HERE ---
    {
      code: ServiceType.VNIN_SLIP,
      name: 'VNIN Slip Generation',
      price: 200.00, // Example price
      description: 'Generate and download standard VNIN Slip PDF.'
    },
    // ------------------------------
    {
      code: ServiceType.AIRTIME,
      name: 'Airtime VTU',
      price: 0.00,
      description: 'Airtime top-up for all networks.'
    }
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { code: service.code },
      update: { price: service.price },
      create: service,
    });
  }

  console.log('Services seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
