import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Services...');

  const services = [
    // --- IDENTITY (NIN) ---
    { code: ServiceType.NIN_VERIFICATION, name: 'NIN Verification', price: 100.00, description: 'Verify using NIN Number.' },
    { code: ServiceType.NIN_SEARCH_BY_PHONE, name: 'NIN By Phone', price: 150.00, description: 'Retrieve NIN using Phone Number.' },
    { code: ServiceType.VNIN_SLIP, name: 'VNIN Slip', price: 200.00, description: 'Generate Standard/Premium Slips.' },
    { code: ServiceType.VNIN_TO_NIBSS, name: 'VNIN to NIBSS', price: 500.00, description: 'Validate for Bank Account.' },
    
    // --- VALIDATION SERVICES ---
    { 
      code: ServiceType.NIN_VALIDATION_NO_RECORD, 
      name: 'NIN Validation (No Record)', 
      price: 350.00, 
      description: 'Validate NIN showing "No Record Found".' 
    },
    { 
      code: ServiceType.NIN_VALIDATION_UPDATE_RECORD, 
      name: 'NIN Validation (Update Record)', 
      price: 500.00, 
      description: 'Validate NIN after detail updates.' 
    },
    // -------------------------------

    { code: ServiceType.NIN_PERSONALIZATION, name: 'NIN Personalization', price: 1000.00, description: 'Personalize NIN Data.' },
    { code: ServiceType.IPE_CLEARANCE, name: 'IPE Clearance', price: 1500.00, description: 'Clear IPE Issues.' },

    // --- IDENTITY (BVN) ---
    { code: ServiceType.BVN_VERIFICATION, name: 'BVN Verification', price: 100.00, description: 'Verify BVN Details.' },
    { code: ServiceType.BVN_RETRIEVAL, name: 'BVN Retrieval', price: 150.00, description: 'Recover Lost BVN.' },
    { code: ServiceType.BVN_MODIFICATION, name: 'BVN Modification', price: 2500.00, description: 'Update BVN Details.' },
    { code: ServiceType.ANDROID_BVN_ENROLLMENT, name: 'Android BVN Enrollment', price: 3000.00, description: 'Enroll via Android Device.' },

    // --- UTILITIES ---
    { code: ServiceType.AIRTIME, name: 'Airtime VTU', price: 0.00, description: 'Airtime Top-up.' },
    { code: ServiceType.DATA, name: 'Data Bundles', price: 0.00, description: 'Internet Data Bundles.' },

    // --- CORPORATE ---
    { code: ServiceType.CAC_REGISTRATION, name: 'CAC Registration', price: 15000.00, description: 'Business Name Registration.' },
    { code: ServiceType.JTB_TIN_REGISTRATION, name: 'TIN Registration', price: 500.00, description: 'Joint Tax Board TIN.' },

    // --- EDUCATION ---
    { code: ServiceType.JAMB_SERVICES, name: 'JAMB Services', price: 4700.00, description: 'UTME/DE Registration.' },
    { code: ServiceType.EXAM_PIN_WAEC, name: 'WAEC Pin', price: 3500.00, description: 'WAEC Result Checker.' },
    { code: ServiceType.EXAM_PIN_NECO, name: 'NECO Pin', price: 1200.00, description: 'NECO Result Checker.' },
    { code: ServiceType.EXAM_PIN_NABTEB, name: 'NABTEB Pin', price: 1000.00, description: 'NABTEB Result Checker.' },
    { code: ServiceType.EXAM_PIN_JAMB, name: 'JAMB Pin', price: 4700.00, description: 'JAMB Result Checker.' },
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
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
