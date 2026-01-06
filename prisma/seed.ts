import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Services...');

  const services = [
    // ==========================================
    // 1. IDENTITY (NIN)
    // ==========================================
    { 
      code: ServiceType.NIN_VERIFICATION, 
      name: 'NIN Verification (By ID)', 
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

    // --- VNIN & SLIPS ---
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

    // --- NIN SLIP PDF TYPES (Codes 401-403) ---
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

    // --- NIN VALIDATION (Codes 329-331) ---
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

    // --- NIN MODIFICATION (Codes 501-503) ---
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


    // ==========================================
    // 2. IDENTITY (BVN)
    // ==========================================
    { code: ServiceType.BVN_VERIFICATION, name: 'BVN Verification', price: 100.00, description: 'Verify BVN Details.', serviceCode: null },
    { code: ServiceType.BVN_RETRIEVAL, name: 'BVN Retrieval', price: 150.00, description: 'Recover Lost BVN.', serviceCode: null },
    { code: ServiceType.ANDROID_BVN_ENROLLMENT, name: 'Android BVN Enrollment', price: 3000.00, description: 'Enroll via Android Device.', serviceCode: null },
    
    // BVN Premium Slip
    { 
      code: ServiceType.BVN_PREMIUM_SLIP, 
      name: 'BVN Premium Slip', 
      price: 1200.00, 
      description: 'Generate High-Resolution BVN Slip', 
      serviceCode: null 
    },

    // --- BVN MODIFICATION CATEGORIES (Codes 620-625) ---
    // These are the BILLABLE services selected by the user
    { code: ServiceType.BVN_MOD_NAME, serviceCode: 620, name: 'BVN Mod: Change of Name', price: 3000.00 },
    { code: ServiceType.BVN_MOD_DOB, serviceCode: 621, name: 'BVN Mod: Change of DOB', price: 3000.00 },
    { code: ServiceType.BVN_MOD_PHONE, serviceCode: 622, name: 'BVN Mod: Change of Phone', price: 2500.00 },
    { code: ServiceType.BVN_MOD_NAME_PHONE, serviceCode: 623, name: 'BVN Mod: Name & Phone', price: 4000.00 },
    { code: ServiceType.BVN_MOD_DOB_PHONE, serviceCode: 624, name: 'BVN Mod: DOB & Phone', price: 4000.00 },
    { code: ServiceType.BVN_MOD_FULL, serviceCode: 625, name: 'BVN Mod: Name, DOB & Phone', price: 5000.00 },

    // --- BVN BANKS (Codes 701-708) ---
    // These exist mostly for the Admin to toggle "Availability". Price is 0 because the Category charges the fee.
    { code: ServiceType.BANK_AGENCY, serviceCode: 701, name: 'Bank: Agency Banking', price: 0 },
    { code: ServiceType.BANK_HERITAGE, serviceCode: 702, name: 'Bank: Heritage Bank', price: 0 },
    { code: ServiceType.BANK_BOA, serviceCode: 703, name: 'Bank: Bank of Agriculture', price: 0 },
    { code: ServiceType.BANK_NIBSS, serviceCode: 704, name: 'Bank: NIBSS MFB', price: 0 },
    { code: ServiceType.BANK_ENTERPRISE, serviceCode: 705, name: 'Bank: Enterprise Bank', price: 0 },
    { code: ServiceType.BANK_FIRSTBANK, serviceCode: 706, name: 'Bank: First Bank', price: 0 },
    { code: ServiceType.BANK_KEYSTONE, serviceCode: 707, name: 'Bank: Keystone Bank', price: 0 },
    { code: ServiceType.BANK_FCMB, serviceCode: 708, name: 'Bank: FCMB', price: 0 },


    // ==========================================
    // 3. UTILITIES & CORPORATE
    // ==========================================
    { code: ServiceType.AIRTIME, name: 'Airtime VTU', price: 0.00, description: 'Airtime Top-up.', serviceCode: null },
    { code: ServiceType.DATA, name: 'Data Bundles', price: 0.00, description: 'Internet Data Bundles.', serviceCode: null },

    { code: ServiceType.CAC_REGISTRATION, name: 'CAC Registration', price: 15000.00, description: 'Business Name Registration.', serviceCode: null },
    { code: ServiceType.JTB_TIN_REGISTRATION, name: 'TIN Registration', price: 500.00, description: 'Joint Tax Board TIN.', serviceCode: null },

    // ==========================================
    // 4. EDUCATION
    // ==========================================
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
        serviceCode: service.serviceCode,
        name: service.name // Update name in case we changed descriptions
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

  console.log('✅ Services seeded successfully.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
