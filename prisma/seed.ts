import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Services...');

  const services = [
    // --- IDENTITY (NIN) ---
    { code: ServiceType.NIN_VERIFICATION, serviceCode: 101, name: 'NIN Verification', price: 100.00, description: 'Verify using NIN Number.' },
    { code: ServiceType.NIN_SEARCH_BY_PHONE, serviceCode: 102, name: 'NIN By Phone', price: 150.00, description: 'Retrieve NIN using Phone Number.' },
    { code: ServiceType.VNIN_SLIP, serviceCode: 103, name: 'VNIN Slip', price: 200.00, description: 'Generate Standard/Premium Slips.' },
    { code: ServiceType.VNIN_TO_NIBSS, serviceCode: 104, name: 'VNIN to NIBSS', price: 500.00, description: 'Validate for Bank Account.' },
    
    // --- VALIDATION SERVICES (The 3 Types) ---
    { 
      code: ServiceType.NIN_VALIDATION_NO_RECORD, 
      serviceCode: 329, 
      name: 'NIN Validation (No Record)', 
      price: 350.00, 
      description: 'Validate NIN showing "No Record Found".' 
    },
    { 
      code: ServiceType.NIN_VALIDATION_UPDATE_RECORD, 
      serviceCode: 330, 
      name: 'NIN Validation (Update Record)', 
      price: 500.00, 
      description: 'Validate NIN after detail updates.' 
    },
    { 
      code: ServiceType.NIN_VALIDATION_VNIN, 
      serviceCode: 331, 
      name: 'V-NIN Validation', 
      price: 450.00, 
      description: 'Validate Virtual NIN.' 
    },
    // ----------------------------------------

    { code: ServiceType.NIN_PERSONALIZATION, serviceCode: 105, name: 'NIN Personalization', price: 1000.00, description: 'Personalize NIN Data.' },
    { code: ServiceType.IPE_CLEARANCE, serviceCode: 106, name: 'IPE Clearance', price: 1500.00, description: 'Clear IPE Issues.' },

    // --- IDENTITY (BVN) ---
    { code: ServiceType.BVN_VERIFICATION, serviceCode: 201, name: 'BVN Verification', price: 100.00, description: 'Verify BVN Details.' },
    { code: ServiceType.BVN_RETRIEVAL, serviceCode: 202, name: 'BVN Retrieval', price: 150.00, description: 'Recover Lost BVN.' },
    { code: ServiceType.BVN_MODIFICATION, serviceCode: 203, name: 'BVN Modification', price: 2500.00, description: 'Update BVN Details.' },
    { code: ServiceType.ANDROID_BVN_ENROLLMENT, serviceCode: 204, name: 'Android BVN Enrollment', price: 3000.00, description: 'Enroll via Android Device.' },

    // --- UTILITIES ---
    { code: ServiceType.AIRTIME, serviceCode: 401, name: 'Airtime VTU', price: 0.00, description: 'Airtime Top-up.' },
    { code: ServiceType.DATA, serviceCode: 402, name: 'Data Bundles', price: 0.00, description: 'Internet Data Bundles.' },

    // --- CORPORATE ---
    { code: ServiceType.CAC_REGISTRATION, serviceCode: 501, name: 'CAC Registration', price: 15000.00, description: 'Business Name Registration.' },
    { code: ServiceType.JTB_TIN_REGISTRATION, serviceCode: 502, name: 'TIN Registration', price: 500.00, description: 'Joint Tax Board TIN.' },

    // --- EDUCATION ---
    { code: ServiceType.JAMB_SERVICES, serviceCode: 601, name: 'JAMB Services', price: 4700.00, description: 'UTME/DE Registration.' },
    { code: ServiceType.EXAM_PIN_WAEC, serviceCode: 602, name: 'WAEC Pin', price: 3500.00, description: 'WAEC Result Checker.' },
    { code: ServiceType.EXAM_PIN_NECO, serviceCode: 603, name: 'NECO Pin', price: 1200.00, description: 'NECO Result Checker.' },
    { code: ServiceType.EXAM_PIN_NABTEB, serviceCode: 604, name: 'NABTEB Pin', price: 1000.00, description: 'NABTEB Result Checker.' },
    { code: ServiceType.EXAM_PIN_JAMB, serviceCode: 605, name: 'JAMB Pin', price: 4700.00, description: 'JAMB Result Checker.' },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { code: service.code },
      update: { 
        price: service.price,
        serviceCode: service.serviceCode 
      },
      create: service,
    });
  }

  console.log('Services seeded successfully.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
