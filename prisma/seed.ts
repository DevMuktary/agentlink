import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AgentLink Services...');

  // ============================================================
  // 1. GENERAL SERVICES (NIN, UTILITIES, EDUCATION, CORPORATE)
  // ============================================================
  const generalServices = [
    // --- IDENTITY (NIN) ---
    { 
      code: ServiceType.NIN_VERIFICATION, 
      name: 'NIN Verification (By NIN)', 
      price: 100.00, 
      description: 'Verify using 11-digit NIN Number.',
      serviceCode: null 
    },
    { 
      code: ServiceType.NIN_SEARCH_BY_PHONE, 
      name: 'NIN Verification (By Phone)', 
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
      serviceCode: null 
    },
    { 
      code: ServiceType.VNIN_TO_NIBSS, 
      name: 'VNIN to NIBSS', 
      price: 500.00, 
      description: 'Validate VNIN for Bank Account.',
      serviceCode: null
    },

    // --- NIN SLIP PDF TYPES (400 Series) ---
    { 
      code: ServiceType.NIN_SLIP_PREMIUM, 
      name: 'NIN Slip (Premium)', 
      price: 1000.00, 
      description: 'Generate Premium Design PDF.',
      serviceCode: 401 
    },
    { 
      code: ServiceType.NIN_SLIP_STANDARD, 
      name: 'NIN Slip (Standard)', 
      price: 700.00, 
      description: 'Generate Standard Design PDF.',
      serviceCode: 402
    },
    { 
      code: ServiceType.NIN_SLIP_REGULAR, 
      name: 'NIN Slip (Regular)', 
      price: 500.00, 
      description: 'Generate Regular Design PDF.',
      serviceCode: 403 
    },

    // --- NIN VALIDATION SERVICES (300 Series) ---
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

    // --- NIN MODIFICATION (500 Series) ---
    {
      code: ServiceType.NIN_MODIFICATION_NAME,
      serviceCode: 501,
      name: 'NIN Modification: Change of Name',
      price: 15000.00,
      description: 'Correction of Name on NIN Database'
    },
    {
      code: ServiceType.NIN_MODIFICATION_PHONE,
      serviceCode: 502,
      name: 'NIN Modification: Change of Phone',
      price: 5000.00,
      description: 'Update Phone Number on NIN Database'
    },
    {
      code: ServiceType.NIN_MODIFICATION_ADDRESS,
      serviceCode: 503,
      name: 'NIN Modification: Change of Address',
      price: 8000.00,
      description: 'Update Residential Address on NIN Database'
    },

    // --- OTHER IDENTITY ---
    { code: ServiceType.NIN_PERSONALIZATION, name: 'NIN Personalization', price: 1000.00, description: 'Personalize NIN Data.', serviceCode: null },
    { code: ServiceType.IPE_CLEARANCE, name: 'IPE Clearance', price: 1500.00, description: 'Clear IPE Issues.', serviceCode: null },

    // --- BASIC BVN SERVICES ---
    { code: ServiceType.BVN_VERIFICATION, name: 'BVN Verification', price: 100.00, description: 'Verify BVN Details.', serviceCode: null },
    { code: ServiceType.BVN_PREMIUM_SLIP, name: 'BVN Premium Slip', price: 1200.00, description: 'Generate High-Resolution BVN Slip.', serviceCode: null },
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

  for (const service of generalServices) {
    await prisma.service.upsert({
      where: { code: service.code },
      update: { 
        price: service.price,
        serviceCode: service.serviceCode,
        name: service.name 
      },
      create: {
        code: service.code,
        name: service.name,
        price: service.price,
        description: service.description,
        serviceCode: service.serviceCode,
        isActive: true
      },
    });
  }

  // ============================================================
  // 2. BVN RETRIEVAL (630 Series)
  // ============================================================
  const bvnRetrievals = [
    { code: 'BVN_RETRIEVAL_PHONE', serviceCode: 630, name: 'BVN Retrieval: By Phone', price: 1000.00 },
    { code: 'BVN_RETRIEVAL_CRM', serviceCode: 631, name: 'BVN Retrieval: CRM (Ticket)', price: 2500.00 },
  ];

  for (const s of bvnRetrievals) {
    await prisma.service.upsert({
      where: { code: s.code as any },
      update: { serviceCode: s.serviceCode, name: s.name, price: s.price },
      create: { 
        code: s.code as any, 
        serviceCode: s.serviceCode, 
        name: s.name, 
        price: s.price, 
        description: 'BVN Retrieval Service',
        isActive: true 
      }
    });
  }

  // ============================================================
  // 3. BVN MODIFICATION CATEGORIES (620 Series)
  // ============================================================
  const bvnModCategories = [
    { code: 'BVN_MOD_NAME', serviceCode: 620, name: 'BVN Mod: Change of Name', price: 3000.00 },
    { code: 'BVN_MOD_DOB', serviceCode: 621, name: 'BVN Mod: Change of DOB', price: 3000.00 },
    { code: 'BVN_MOD_PHONE', serviceCode: 622, name: 'BVN Mod: Change of Phone', price: 2500.00 },
    { code: 'BVN_MOD_NAME_PHONE', serviceCode: 623, name: 'BVN Mod: Name & Phone', price: 4000.00 },
    { code: 'BVN_MOD_DOB_PHONE', serviceCode: 624, name: 'BVN Mod: DOB & Phone', price: 4000.00 },
    { code: 'BVN_MOD_FULL', serviceCode: 625, name: 'BVN Mod: Name, DOB & Phone', price: 5000.00 },
  ];

  for (const s of bvnModCategories) {
    await prisma.service.upsert({
      where: { code: s.code as any },
      update: { serviceCode: s.serviceCode, name: s.name, price: s.price },
      create: { 
        code: s.code as any, 
        serviceCode: s.serviceCode, 
        name: s.name, 
        price: s.price, 
        description: 'BVN Modification Category',
        isActive: true 
      }
    });
  }

  // ============================================================
  // 4. BVN MODIFICATION BANKS (700 Series - Toggles)
  // ============================================================
  const bvnBanks = [
    { code: 'BANK_AGENCY', serviceCode: 701, name: 'Bank: Agency Banking' },
    { code: 'BANK_HERITAGE', serviceCode: 702, name: 'Bank: Heritage Bank' },
    { code: 'BANK_BOA', serviceCode: 703, name: 'Bank: Bank of Agriculture' },
    { code: 'BANK_NIBSS', serviceCode: 704, name: 'Bank: NIBSS MFB' },
    { code: 'BANK_ENTERPRISE', serviceCode: 705, name: 'Bank: Enterprise Bank' },
    { code: 'BANK_FIRSTBANK', serviceCode: 706, name: 'Bank: First Bank' },
    { code: 'BANK_KEYSTONE', serviceCode: 707, name: 'Bank: Keystone Bank' },
    { code: 'BANK_FCMB', serviceCode: 708, name: 'Bank: FCMB' },
  ];

  for (const b of bvnBanks) {
    await prisma.service.upsert({
      where: { code: b.code as any },
      update: { serviceCode: b.serviceCode, name: b.name },
      create: { 
        code: b.code as any, 
        serviceCode: b.serviceCode, 
        name: b.name, 
        price: 0, // Banks don't have price, the Category does
        description: 'BVN Modification Bank Option',
        isActive: true 
      }
    });
  }

  console.log('✅ Services seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
