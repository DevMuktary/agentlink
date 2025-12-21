import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Services...');

  const services = [
    {
      code: ServiceType.NIN_VERIFICATION,
      name: 'NIN Verification (By Number)',
      price: 100.00, // ₦100
      description: 'Verify identity using 11-digit NIN.'
    },
    {
      code: ServiceType.NIN_SEARCH_BY_PHONE,
      name: 'NIN Verification (By Phone)',
      price: 150.00, // ₦150 (Usually more expensive)
      description: 'Retrieve NIN details using Phone Number.'
    },
    {
      code: ServiceType.AIRTIME,
      name: 'Airtime VTU',
      price: 0.00, // Percentage based usually, but 0 base
      description: 'Airtime top-up for all networks.'
    },
    // Add others as needed...
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { code: service.code },
      update: { price: service.price }, // Update price if exists
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
