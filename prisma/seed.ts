import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Services...');

  const services = [
    // --- IDENTITY (NIN) ---
    { 
      code: ServiceType.NIN_VERIFICATION, 
      name: 'NIN Verification', 
      price: 100.00, 
      description: 'Verify using NIN Number.',
      serviceCode: null // No code needed
    },
    { 
      code: ServiceType.NIN_SEARCH_BY_PHONE, 
      name: 'NIN By Phone', 
      price: 150.00, 
      description: 'Retrieve NIN using Phone Number.',
      serviceCode: null
    },

    // --- VNIN SERVICES ---
    { 
      code: ServiceType.VNIN_SLIP, 
      name: 'VNIN Slip Generation', 
      price: 200.00, 
      description: 'Generate Standard VNIN Slip PDF.',
      serviceCode: null // Removed code as requested
    },
    { 
      code: ServiceType.VNIN_TO_NIBSS, 
      name: 'VNIN to NIBSS', 
      price: 500.00, 
      description: 'Validate VNIN for Bank Account.',
      serviceCode: null
    },

    // --- NIN SLIP PDF TYPES ---
    { 
      code: ServiceType.NIN_SLIP_PREMIUM, 
      name: 'NIN Slip (Premium)', 
      price: 1000.00, 
      description: 'Generate Premium Design PDF.',
      serviceCode: null 
    },
    { 
      code: ServiceType.NIN_SLIP_STANDARD, 
      name: 'NIN Slip (Standard)', 
      price: 700.00, 
      description: 'Generate Standard Design PDF.',
      serviceCode: null 
    },
    { 
      code: ServiceType.NIN_SLIP_REGULAR, 
      name: 'NIN Slip (Regular)', 
      price: 500.00, 
      description: 'Generate Regular Design PDF.',
      serviceCode: null 
    },

    // --- VALIDATION SERVICES (Codes REQUIRED here) ---
    { 
      code: ServiceType.NIN_VALIDATION_NO_RECORD, 
      serviceCode: 329, // Required for user option selection
      name: 'NIN Validation (No Record)', 
      price: 350.00, 
      description: 'Validate NIN showing "No Record Found".' 
    },
    { 
      code: ServiceType.NIN_VALIDATION_UPDATE_RECORD, 
      serviceCode: 330, // Required for user option selection
      name: 'NIN Validation (Update Record)', 
      price: 500.00, 
      description: 'Validate NIN after detail updates.' 
    },
    { 
      code: ServiceType.NIN_VALIDATION_VNIN, 
      serviceCode: 331, // Required for user option selection
      name: 'V-NIN Validation', 
      price: 450.00, 
      description: 'Validate Virtual NIN.' 
    },

    // --- OTHER IDENTITY ---
    { code: ServiceType.NIN_PERSONALIZATION, name: 'NIN Personalization', price: 1000.00, description: 'Personalize NIN Data.', serviceCode: null },
    { code: ServiceType.IPE_CLEARANCE, name: 'IPE Clearance', price: 1500.00, description: 'Clear IPE Issues.', serviceCode: null },

    // --- IDENTITY (BVN) ---
    { code: ServiceType.BVN_VERIFICATION, name: 'BVN Verification', price: 100.00, description: 'Verify BVN Details.', serviceCode: null },
    { code: ServiceType.BVN_RETRIEVAL, name: 'BVN Retrieval', price: 150.00, description: 'Recover Lost BVN.', serviceCode: null },
    { code: ServiceType.BVN_MODIFICATION, name: 'BVN Modification', price: 2500.00, description: 'Update BVN Details.', serviceCode: null },
    { code: ServiceType.ANDROID_BVN_ENROLLMENT, name: 'Android BVN Enrollment', price: 3000.00, description: 'Enroll via Android Device.', serviceCode: null },

    // --- UTILITIES ---
    { code: ServiceType.AIRTIME, name: 'Airtime VTU', price: 0.00, description: 'Airtime Top-up.', serviceCode: null },
    { code: ServiceType.DATA, name: 'Data Bundles', price: 0.00, description: 'Internet Data Bundles.', serviceCode: null },

    // --- CORPORATE ---
    { code: ServiceType.CAC_REGISTRATION, name: 'CAC Registration', price: 15000.00, description: 'Business Name Registration.', serviceCode: null },
    { code: ServiceType.JTB_TIN_REGISTRATION, name: 'TIN Registration', price: 500.00, description: 'Joint Tax Board TIN.', serviceCode: null },

    // --- EDUCATION ---
    { code: ServiceType.JAMB_SERVICES, name: 'JAMB Services', price: 4700.00, description: 'UTME/DE Registration.', serviceCode: null },
    { code: ServiceType.EXAM_PIN_WAEC, name: 'WAEC Pin', price: 3500.00, description: 'WAEC Result Checker.', serviceCode: null },
    { code: ServiceType.EXAM_PIN_NECO, name: 'NECO Pin', price: 1200.00, description: 'NECO Result Checker.', serviceCode: null },
    { code: ServiceType.EXAM_PIN_NABTEB, name: 'NABTEB Pin', price: 1000.00, description: 'NABTEB Result Checker.', serviceCode: null },
    { code: ServiceType.EXAM_PIN_JAMB, name: 'JAMB Pin', price: 4700.00, description: 'JAMB Result Checker.', serviceCode: null },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { code: service.code },
      update: { 
        price: service.price,
        serviceCode: service.serviceCode 
      },
      create: {
        code: service.code,
        name: service.name,
        price: service.price,
        description: service.description,
        serviceCode: service.serviceCode
      },
    });
  }

  console.log('Services seeded successfully.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
