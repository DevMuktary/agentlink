import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AgentLink Ecosystem...');

  // ============================================================
  // 1. CORE SERVICES (NIN, BVN, UTILITIES, CORP, EDU)
  // ============================================================
  const coreServices = [
    // NIN
    { code: ServiceType.NIN_VERIFICATION, name: 'NIN Verification (By NIN)', price: 100.00 },
    { code: ServiceType.NIN_SEARCH_BY_PHONE, name: 'NIN Verification (By Phone)', price: 150.00 },
    { code: ServiceType.VNIN_SLIP, name: 'VNIN Slip Generation', price: 200.00 },
    { code: ServiceType.VNIN_TO_NIBSS, name: 'VNIN to NIBSS', price: 500.00 },
    
    // NIN SLIPS
    { code: ServiceType.NIN_SLIP_PREMIUM, name: 'NIN Slip (Premium)', price: 1000.00, serviceCode: 401 },
    { code: ServiceType.NIN_SLIP_STANDARD, name: 'NIN Slip (Standard)', price: 700.00, serviceCode: 402 },
    { code: ServiceType.NIN_SLIP_REGULAR, name: 'NIN Slip (Regular)', price: 500.00, serviceCode: 403 },

    // NIN VALIDATION
    { code: ServiceType.NIN_VALIDATION_NO_RECORD, name: 'NIN Validation (No Record)', price: 350.00, serviceCode: 329 },
    { code: ServiceType.NIN_VALIDATION_UPDATE_RECORD, name: 'NIN Validation (Update Record)', price: 500.00, serviceCode: 330 },
    { code: ServiceType.NIN_VALIDATION_VNIN, name: 'V-NIN Validation', price: 450.00, serviceCode: 331 },

    // NIN MODIFICATION
    { code: ServiceType.NIN_MODIFICATION_NAME, name: 'NIN Mod: Change of Name', price: 15000.00, serviceCode: 501 },
    { code: ServiceType.NIN_MODIFICATION_PHONE, name: 'NIN Mod: Change of Phone', price: 5000.00, serviceCode: 502 },
    { code: ServiceType.NIN_MODIFICATION_ADDRESS, name: 'NIN Mod: Change of Address', price: 8000.00, serviceCode: 503 },

    // OTHER IDENTITY
    { code: ServiceType.NIN_PERSONALIZATION, name: 'NIN Personalization', price: 1000.00 },
    { code: ServiceType.IPE_CLEARANCE, name: 'IPE Clearance', price: 1500.00 },

    // BVN
    { code: ServiceType.BVN_VERIFICATION, name: 'BVN Verification', price: 100.00 },
    { code: ServiceType.BVN_PREMIUM_SLIP, name: 'BVN Premium Slip', price: 1200.00 },
    { code: ServiceType.ANDROID_BVN_ENROLLMENT, name: 'Android BVN Enrollment', price: 3000.00 },
    { code: ServiceType.BVN_RETRIEVAL_PHONE, name: 'BVN Retrieval: Phone', price: 1000.00, serviceCode: 630 },
    { code: ServiceType.BVN_RETRIEVAL_CRM, name: 'BVN Retrieval: CRM', price: 2500.00, serviceCode: 631 },
    {code: ServiceType.VNIN_TO_NIBSS, name: 'VNIN to NIBSS', price: 500.00 },
   
    // BVN MODIFICATION.
    { code: ServiceType.BVN_MOD_NAME, name: 'BVN Mod: Name', price: 3000.00, serviceCode: 620 },
    { code: ServiceType.BVN_MOD_DOB, name: 'BVN Mod: DOB', price: 3000.00, serviceCode: 621 },
    { code: ServiceType.BVN_MOD_PHONE, name: 'BVN Mod: Phone', price: 2500.00, serviceCode: 622 },
    { code: ServiceType.BVN_MOD_NAME_PHONE, name: 'BVN Mod: Name & Phone', price: 4000.00, serviceCode: 623 },
    { code: ServiceType.BVN_MOD_DOB_PHONE, name: 'BVN Mod: DOB & Phone', price: 4000.00, serviceCode: 624 },
    { code: ServiceType.BVN_MOD_FULL, name: 'BVN Mod: Full Details', price: 5000.00, serviceCode: 625 },

    // CORPORATE
    { code: ServiceType.CAC_REGISTRATION, name: 'CAC Registration', price: 15000.00 },
    { code: ServiceType.TAX_ID_INDIVIDUAL, name: 'Tax ID: Individual', price: 1000.00, serviceCode: 801 },
    { code: ServiceType.TAX_ID_NON_INDIVIDUAL, name: 'Tax ID: Corporate', price: 2500.00, serviceCode: 802 },

    // UTILITIES & DATA (Generic)
    { code: ServiceType.AIRTIME_MTN, name: 'MTN Airtime', price: 99.00 }, // 99%
    { code: ServiceType.AIRTIME_GLO, name: 'GLO Airtime', price: 98.00 }, 
    { code: ServiceType.AIRTIME_AIRTEL, name: 'Airtel Airtime', price: 99.00 },
    { code: ServiceType.AIRTIME_9MOBILE, name: '9Mobile Airtime', price: 98.50 },
    { code: ServiceType.DATA, name: 'Data Bundle Service', price: 0.00 }, // Placeholder

    // EDUCATION
    { code: ServiceType.JAMB_SERVICES, name: 'JAMB Services', price: 4700.00 },
    { code: ServiceType.EXAM_PIN_WAEC, name: 'WAEC Pin', price: 3500.00 },
    { code: ServiceType.EXAM_PIN_NECO, name: 'NECO Pin', price: 1200.00 },
    { code: ServiceType.EXAM_PIN_NABTEB, name: 'NABTEB Pin', price: 1000.00 },
    { code: ServiceType.EXAM_PIN_JAMB, name: 'JAMB Pin', price: 4700.00 },
    { code: ServiceType.EXAM_PIN_JAMB_UTME, name: 'JAMB UTME Pin', price: 4800.00 }, 
    { code: ServiceType.EXAM_PIN_JAMB_DE, name: 'JAMB Direct Entry', price: 4800.00 },
  ];

  for (const s of coreServices) {
    await prisma.service.upsert({
      where: { code: s.code },
      update: { price: s.price, serviceCode: s.serviceCode, name: s.name },
      create: {
        code: s.code,
        name: s.name,
        price: s.price,
        serviceCode: s.serviceCode,
        isActive: true
      }
    });
  }

  // ============================================================
  // 2. BVN BANKS (700 Series)
  // ============================================================
  const banks = [
    { code: 'BANK_AGENCY', serviceCode: 701, name: 'Bank: Agency Banking' },
    { code: 'BANK_HERITAGE', serviceCode: 702, name: 'Bank: Heritage Bank' },
    { code: 'BANK_BOA', serviceCode: 703, name: 'Bank: Bank of Agriculture' },
    { code: 'BANK_NIBSS', serviceCode: 704, name: 'Bank: NIBSS MFB' },
    { code: 'BANK_ENTERPRISE', serviceCode: 705, name: 'Bank: Enterprise Bank' },
    { code: 'BANK_FIRSTBANK', serviceCode: 706, name: 'Bank: First Bank' },
    { code: 'BANK_KEYSTONE', serviceCode: 707, name: 'Bank: Keystone Bank' },
    { code: 'BANK_FCMB', serviceCode: 708, name: 'Bank: FCMB' },
  ];

  for (const b of banks) {
    await prisma.service.upsert({
      where: { code: b.code as any },
      update: { serviceCode: b.serviceCode, name: b.name },
      create: { code: b.code as any, serviceCode: b.serviceCode, name: b.name, price: 0, isActive: true }
    });
  }
  // ============================================================
  // 3. JAMB SERVICES (900 Series)
  // ============================================================
  const jambServices = [
    { code: 'JAMB_ORIGINAL_RESULT', serviceCode: 901, name: 'JAMB Original Result', price: 2500.00 },
    { code: 'JAMB_ADMISSION_LETTER', serviceCode: 902, name: 'JAMB Admission Letter', price: 2500.00 },
    { code: 'JAMB_REGISTRATION_SLIP', serviceCode: 903, name: 'JAMB Registration Slip', price: 2000.00 },
    { code: 'JAMB_PROFILE_CODE_RETRIEVAL', serviceCode: 904, name: 'JAMB Profile Code Retrieval', price: 1000.00 },
  ];

  for (const s of jambServices) {
    await prisma.service.upsert({
      where: { code: s.code as any },
      update: { serviceCode: s.serviceCode, name: s.name, price: s.price },
      create: { 
        code: s.code as any, 
        serviceCode: s.serviceCode, 
        name: s.name, 
        price: s.price, 
        description: 'Manual JAMB Service',
        isActive: true 
      }
    });
  }
  
  // ============================================================
  // 3. DATA PLANS (The Big List)
  // ============================================================
  const dataPlans = [
    // MTN DIRECT DATA
    { productCode: 'mtn_17gb30days', name: 'MTN 17GB/30DAYS', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '30 Days' },
    { productCode: 'mtn_250gb_90days', name: 'MTN 250GB 90DAYS', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '90 Days' },
    { productCode: 'mtn_20gb30days', name: 'MTN 20GB/30Days', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '30 Days' },
    { productCode: 'mtn_120gb30days', name: 'MTN 120GB/30Days', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '30 Days' },
    { productCode: 'mtn_30gb60days', name: 'MTN 30GB/60days', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '60 Days' },
    { productCode: 'mtn_25gb30days', name: 'MTN 25GB/30DAYS', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '30 Days' },
    { productCode: 'mtn_1tb365days', name: 'MTN 1Tb/365Days', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '365 Days' },
    { productCode: 'mtn_200gb30days', name: 'MTN 200GB/30DAYS', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '30 Days' },
    { productCode: 'mtn_100gb60days', name: 'MTN 100GB/60DAYS', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '60 Days' },
    { productCode: 'mtn_160gb60days', name: 'MTN 160GB/60DAYS', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '60 Days' },
    { productCode: 'mtn_1gb1_day', name: 'MTN 1GB/1 Day', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '1 Day' },
    { productCode: 'mtn_3_5gb2_days', name: 'MTN 3.5GB/2 Days', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '2 Days' },
    { productCode: 'mtn_15gb7_days', name: 'MTN 15GB/7 Days', price: 0, network: 'MTN', category: 'DIRECT_DATA', validity: '7 Days' },

    // MTN DIRECT GIFTING
    { productCode: 'mtn_10gb_30days', name: 'MTN 10GB 30DAYS', price: 4320, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_2_7gb_30days', name: 'MTN 2.7GB 30DAYS', price: 1920, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_20gb_30days', name: 'MTN 20GB 30DAYS', price: 7200, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_25gb_30days', name: 'MTN 25GB 30DAYS', price: 8640, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_75gb_30days', name: 'MTN 75GB 30DAYS', price: 17280, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_250gb_30days', name: 'MTN 250GB 30DAYS', price: 52800, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_90gb_60days', name: 'MTN 90GB 60DAYS', price: 24000, network: 'MTN', category: 'GIFTING', validity: '60 Days' },
    { productCode: 'mtn_200gb_60days', name: 'MTN 200GB 60DAYS', price: 48000, network: 'MTN', category: 'GIFTING', validity: '60 Days' },
    { productCode: 'mtn_150gb_60days', name: 'MTN 150GB 60DAYS', price: 38400, network: 'MTN', category: 'GIFTING', validity: '60 Days' },
    { productCode: 'mtn_2gb_30days', name: 'MTN 2GB 30DAYS', price: 1440, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_3_5gb_30days', name: 'MTN 3.5GB 30DAYS', price: 2400, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_12_5gb_30days', name: 'MTN 12.5GB 30DAYS', price: 5280, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_16_5gb_30days', name: 'MTN 16.5GB 30DAYS', price: 6240, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_36gb_30days', name: 'MTN 36GB 30DAYS', price: 10560, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_165gb_30days', name: 'MTN 165GB 30DAYS', price: 33600, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_7gb_30days', name: 'MTN 7GB 30DAYS', price: 3360, network: 'MTN', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'mtn_800gb_365_days', name: 'MTN 800GB 365 Days', price: 120000, network: 'MTN', category: 'GIFTING', validity: '365 Days' },

    // GLO DIRECT GIFTING
    { productCode: 'glo_2_6gb30days', name: 'Glo 2.6GB/30Days', price: 920, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_5gb30days', name: 'Glo 5GB/30Days', price: 1380, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_6_15gb30days', name: 'Glo 6.15GB/30Days', price: 1840, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_7_25gb30days', name: 'Glo 7.25GB/30Days', price: 2300, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_10gb30days', name: 'Glo 10GB/30Days', price: 2760, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_12_5gb30days', name: 'Glo 12.5GB/30Days', price: 3680, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_16gb30days', name: 'Glo 16GB/30Days', price: 4600, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_28gb30days', name: 'Glo 28GB/30Days', price: 7360, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_38gb30days', name: 'Glo 38GB/30Days', price: 9200, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_64gb30days', name: 'Glo 64GB/30Days', price: 13800, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_107gb30days', name: 'Glo 107GB/30Days', price: 18400, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_135gb30days', name: 'Glo 135GB/30Days', price: 23000, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_165gb30days', name: 'Glo 165GB/30Days', price: 27600, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_220gb30days', name: 'Glo 220GB/30Days', price: 36800, network: 'GLO', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'glo_310gb60days', name: 'Glo 310GB/60Days', price: 46000, network: 'GLO', category: 'GIFTING', validity: '60 Days' },
    { productCode: 'glo_380gb90days', name: 'Glo 380GB/90Days', price: 55200, network: 'GLO', category: 'GIFTING', validity: '90 Days' },
    { productCode: 'glo_475gb90days', name: 'Glo 475GB/90Days', price: 69000, network: 'GLO', category: 'GIFTING', validity: '90 Days' },
    { productCode: 'glo_1tb365days', name: 'Glo 1TB/365Days', price: 138000, network: 'GLO', category: 'GIFTING', validity: '365 Days' },

    // AIRTEL DIRECT GIFTING
    { productCode: 'airtel_2gb30days', name: 'Airtel 2GB/30days', price: 1440, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_3gb30days', name: 'Airtel 3GB/30days', price: 1920, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_10gb30days', name: 'Airtel 10GB/30DAYS', price: 3840, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_1gb7_days', name: 'AIRTEL 1GB/7 Days', price: 768, network: 'AIRTEL', category: 'GIFTING', validity: '7 Days' },
    { productCode: 'airtel_500mb7_days', name: 'AIRTEL 500mb/7 Days', price: 480, network: 'AIRTEL', category: 'GIFTING', validity: '7 Days' },
    { productCode: 'airtel_4gb30days', name: 'Airtel 4GB/30days', price: 2400, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_8gb30days', name: 'Airtel 8GB/30DAYS', price: 2880, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_13gb30days', name: 'Airtel 13GB/30DAYS', price: 4800, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_18gb30days', name: 'Airtel 18GB/30DAYS', price: 5760, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_25gb30days', name: 'Airtel 25GB/30DAYS', price: 7680, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_35gb30days', name: 'Airtel 35GB/30DAYS', price: 9600, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_60gb30days', name: 'Airtel 60GB/30DAYS', price: 14400, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_100gb30days', name: 'Airtel 100GB/30DAYS', price: 19200, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_160gb30days', name: 'Airtel 160GB/30DAYS', price: 28800, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_210gb30days', name: 'Airtel 210GB/30DAYS', price: 38400, network: 'AIRTEL', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'airtel_300gb90days', name: 'Airtel 300GB/90DAYS', price: 48000, network: 'AIRTEL', category: 'GIFTING', validity: '90 Days' },
    { productCode: 'airtel_650gb365days', name: 'Airtel 650GB/365DAYS', price: 96000, network: 'AIRTEL', category: 'GIFTING', validity: '365 Days' },

    // 9MOBILE DIRECT GIFTING
    { productCode: 'etisalat_2gb30days', name: 'etisalat 2GB/30Days', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'etisalat_4_5gb30days', name: 'etisalat 4.5GB/30Days', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'etisalat_11gb30days', name: 'etisalat 11GB/30Days', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'etisalat_75gb30days', name: 'etisalat 75GB/30Days', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'etisalat_1_5gb30days', name: '9Mobile 1.5GB/30days', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'etisalat_40gb30days', name: '9Mobile 40GB/30days', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'etisalat_3gb30days', name: '9Mobile 3GB/30days', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'etisalat_15gb30days', name: '9Mobile 15GB/30days', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '30 Days' },
    { productCode: 'etisalat_75gb3_months', name: '9Mobile 75GB/3 Months', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '3 Months' },
    { productCode: 'etisalat_165gb6_months', name: '9Mobile 165GB/6 Months', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '6 Months' },
    { productCode: 'etisalat_365gb1_year', name: '9Mobile 365GB/1 Year', price: 0, network: '9MOBILE', category: 'GIFTING', validity: '1 Year' },

    // MTN SME DATA
    { productCode: 'mtn_sme_1gb', name: 'MTN SME 1GB', price: 405, network: 'MTN', category: 'SME', validity: '30 Days' },
    { productCode: 'data_share_2gb', name: 'MTN SME 2GB', price: 1010, network: 'MTN', category: 'SME', validity: '30 Days' },
    { productCode: 'data_share_5gb', name: 'MTN SME 5GB', price: 2525, network: 'MTN', category: 'SME', validity: '30 Days' },
    { productCode: 'mtn_sme_500mb', name: 'MTN SME 500MB', price: 320, network: 'MTN', category: 'SME', validity: '30 Days' },
    { productCode: 'data_share_3gb', name: 'MTN SME 3GB', price: 1515, network: 'MTN', category: 'SME', validity: '30 Days' },
    { productCode: 'data_share_10gb', name: 'MTN SME 10GB', price: 5050, network: 'MTN', category: 'SME', validity: '30 Days' },
    { productCode: 'mtn_sme_igb_monthly', name: 'MTN SME IGB MONTHLY', price: 520, network: 'MTN', category: 'SME', validity: '30 Days' },

    // GLO COOPERATE DATA (CG)
    { productCode: 'glo_cg_200mb_14days', name: 'Glo CG 200MB 14Days', price: 79, network: 'GLO', category: 'CORPORATE', validity: '14 Days' },
    { productCode: 'glo_cg_500mb_30days', name: 'Glo CG 500MB 30days', price: 197.5, network: 'GLO', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'glo_cg_1gb_30days', name: 'Glo CG 1GB 30days', price: 395, network: 'GLO', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'glo_cg_2gb_30days', name: 'Glo CG 2GB 30days', price: 790, network: 'GLO', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'glo_cg_3gb_30days', name: 'Glo CG 3GB 30days', price: 1185, network: 'GLO', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'glo_cg_5gb_30days', name: 'Glo CG 5GB 30days', price: 1975, network: 'GLO', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'glo_cg_10gb_30days', name: 'Glo CG 10GB 30days', price: 3950, network: 'GLO', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'glo_cg_1gb_3_days', name: 'Glo CG 1GB 3 days', price: 250, network: 'GLO', category: 'CORPORATE', validity: '3 Days' },
    { productCode: 'glo_cg_3gb_3_days', name: 'Glo CG 3GB 3 days', price: 750, network: 'GLO', category: 'CORPORATE', validity: '3 Days' },
    { productCode: 'glo_cg_5gb_3_days', name: 'Glo CG 5GB 3 days', price: 1250, network: 'GLO', category: 'CORPORATE', validity: '3 Days' },
    { productCode: 'glo_cg_1gb_7_days', name: 'Glo CG 1GB 7 days', price: 290, network: 'GLO', category: 'CORPORATE', validity: '7 Days' },
    { productCode: 'glo_cg_3gb_7_days', name: 'Glo CG 3GB 7 days', price: 870, network: 'GLO', category: 'CORPORATE', validity: '7 Days' },
    { productCode: 'glo_cg_5gb_7_days', name: 'Glo CG 5GB 7 days', price: 1450, network: 'GLO', category: 'CORPORATE', validity: '7 Days' },

    // AIRTEL COOPERATE DATA
    { productCode: 'airtel_100mb_7days', name: 'Airtel 100MB 7Days', price: 0, network: 'AIRTEL', category: 'CORPORATE', validity: '7 Days' },
    { productCode: 'airtel_300mb_7days', name: 'Airtel 300MB 7Days', price: 0, network: 'AIRTEL', category: 'CORPORATE', validity: '7 Days' },
    { productCode: 'airtel_500mb_30days', name: 'Airtel 500MB 30Days', price: 0, network: 'AIRTEL', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'airtel_1gb_30days', name: 'Airtel 1GB 30Days', price: 0, network: 'AIRTEL', category: 'CORPORATE', validity: '30 Days' },

    // 9MOBILE SME
    { productCode: 'etisalat_sme_1gb', name: '9Mobile SME 1GB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },
    { productCode: 'etisalat_sme_1_5gb', name: '9Mobile SME 1.5GB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },
    { productCode: 'etisalat_sme_2gb', name: '9Mobile SME 2GB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },
    { productCode: 'etisalat_sme_3gb', name: '9Mobile SME 3GB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },
    { productCode: 'etisalat_sme_5gb', name: '9Mobile SME 5GB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },
    { productCode: 'etisalat_sme_10gb', name: '9Mobile SME 10GB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },
    { productCode: 'etisalat_sme_15gb', name: '9Mobile SME 15GB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },
    { productCode: 'etisalat_sme_20gb', name: '9Mobile SME 20GB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },
    { productCode: 'etisalat_sme_50gb', name: '9Mobile SME 50GB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },
    { productCode: 'etisalat_sme_500mb', name: '9Mobile SME 500MB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },
    { productCode: 'etisalat_sme_100gb', name: '9Mobile SME 100GB', price: 0, network: '9MOBILE', category: 'SME', validity: '30 Days' },

    // MTN COOPERATE DATA
    { productCode: 'corporate_data_10gb', name: 'Corporate DATA 10GB', price: 0, network: 'MTN', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'corporate_data_5gb', name: 'Corporate DATA 5GB', price: 0, network: 'MTN', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'corporate_data_3gb', name: 'Corporate DATA 3GB', price: 0, network: 'MTN', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'corporate_data_2gb', name: 'Corporate DATA 2GB', price: 0, network: 'MTN', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'corporate_data_1gb', name: 'Corporate DATA 1GB', price: 0, network: 'MTN', category: 'CORPORATE', validity: '30 Days' },
    { productCode: 'corporate_data_500mb', name: 'Corporate DATA 500MB', price: 0, network: 'MTN', category: 'CORPORATE', validity: '30 Days' },

    // MTN DIRECT DATA COUPON
    { productCode: 'mtn_3gb_30_days_coupon', name: 'MTN 3GB 30 days coupon', price: 0, network: 'MTN', category: 'DATA_COUPON', validity: '30 Days' },
    { productCode: 'mtn_9gb_30_days_coupon', name: 'MTN 9GB 30 days coupon', price: 0, network: 'MTN', category: 'DATA_COUPON', validity: '30 Days' },
    { productCode: 'mtn_12gb_30_days_coupon', name: 'MTN 12GB 30 days coupon', price: 0, network: 'MTN', category: 'DATA_COUPON', validity: '30 Days' },
    { productCode: 'mtn_24gb_30_days_coupon', name: 'MTN 24GB 30 days coupon', price: 0, network: 'MTN', category: 'DATA_COUPON', validity: '30 Days' },
    { productCode: 'mtn_6gb_30_days_coupon', name: 'MTN 6GB 30 days coupon', price: 0, network: 'MTN', category: 'DATA_COUPON', validity: '30 Days' },

    // MTN SME 2
    { productCode: 'mtn_1gb_30_days_sme_2', name: 'MTN 1GB 30 DAYS SME 2', price: 0, network: 'MTN', category: 'SME_2', validity: '30 Days' },
    { productCode: 'mtn_2gb_30_days_sme_2', name: 'MTN 2GB 30 DAYS SME 2', price: 0, network: 'MTN', category: 'SME_2', validity: '30 Days' },
    { productCode: 'mtn_3gb_30_days_sme_2', name: 'MTN 3GB 30 DAYS SME 2', price: 0, network: 'MTN', category: 'SME_2', validity: '30 Days' },
    { productCode: 'mtn_5gb_30_days_sme_2', name: 'MTN 5GB 30 DAYS SME 2', price: 0, network: 'MTN', category: 'SME_2', validity: '30 Days' },
    { productCode: 'mtn_10gb_30_days_sme_2', name: 'MTN 10GB 30 DAYS SME 2', price: 0, network: 'MTN', category: 'SME_2', validity: '30 Days' },
    { productCode: 'mtn_500mb_30_days_sme_2', name: 'MTN 500MB 30 DAYS SME 2', price: 0, network: 'MTN', category: 'SME_2', validity: '30 Days' },

    // MTN DATA SHARE
    { productCode: 'mtn_5gb_data_share', name: 'MTN 5GB Data share', price: 1750, network: 'MTN', category: 'DATA_SHARE', validity: '30 Days' },
    { productCode: 'mtn_3gb_data_share', name: 'MTN 3GB Data share', price: 1350, network: 'MTN', category: 'DATA_SHARE', validity: '30 Days' },
    { productCode: 'mtn_2gb_data_share', name: 'MTN 2GB Data share', price: 900, network: 'MTN', category: 'DATA_SHARE', validity: '30 Days' },
    { productCode: 'mtn_1gb_data_share', name: 'MTN 1GB Data share', price: 405, network: 'MTN', category: 'DATA_SHARE', validity: '30 Days' },
    { productCode: 'mtn_500mb_data_share', name: 'MTN 500MB Data share', price: 320, network: 'MTN', category: 'DATA_SHARE', validity: '30 Days' },
    { productCode: 'mtn_1gb_data_share_30_days', name: 'MTN 1GB Data share 30 days', price: 520, network: 'MTN', category: 'DATA_SHARE', validity: '30 Days' },
    { productCode: 'mtn_3gb_data_share_7_days', name: 'MTN 3GB Data share 7 days', price: 1250, network: 'MTN', category: 'DATA_SHARE', validity: '7 Days' },
    { productCode: 'mtn_2gb_data_share_7_days', name: 'MTN 2GB Data share 7 days', price: 850, network: 'MTN', category: 'DATA_SHARE', validity: '7 Days' },

    // AIRTEL SME
    { productCode: 'airtel_10gb30_days', name: 'AIRTEL 10GB/30 Days', price: 3048.5, network: 'AIRTEL', category: 'SME', validity: '30 Days' },
    { productCode: 'airtel_1_5gb7_days', name: 'AIRTEL 1.5GB/7 Days', price: 1001, network: 'AIRTEL', category: 'SME', validity: '7 Days' },
    { productCode: 'airtel_7gb7_days', name: 'AIRTEL 7GB/7 Days', price: 2047.5, network: 'AIRTEL', category: 'SME', validity: '7 Days' },
    { productCode: 'airtel_10gb7_days', name: 'AIRTEL 10GB/7 Days', price: 3003, network: 'AIRTEL', category: 'SME', validity: '7 Days' },
    { productCode: 'airtel_18gb7_days', name: 'AIRTEL 18GB/7 Days', price: 5005, network: 'AIRTEL', category: 'SME', validity: '7 Days' },
    { productCode: 'airtel_600mb2_days', name: 'AIRTEL 600MB/2 Days', price: 222.95, network: 'AIRTEL', category: 'SME', validity: '2 Days' },
    { productCode: 'airtel_6gb7_days', name: 'AIRTEL 6GB/7 Days', price: 2502.5, network: 'AIRTEL', category: 'SME', validity: '7 Days' },
    { productCode: 'airtel_1gb1_day_special', name: 'AIRTEL 1GB/1 DAY SPECIAL', price: 491.4, network: 'AIRTEL', category: 'SME', validity: '1 Day' },
    { productCode: 'airtel_1_5gb2_days_special', name: 'AIRTEL 1.5GB/2 DAYS SPECIAL', price: 609.7, network: 'AIRTEL', category: 'SME', validity: '2 Days' },
    { productCode: 'airtel_2gb2_days_special', name: 'AIRTEL 2GB/2 DAYS SPECIAL', price: 773.5, network: 'AIRTEL', category: 'SME', validity: '2 Days' },
    { productCode: 'airtel_3gb2_days_special', name: 'AIRTEL 3GB/2 DAYS SPECIAL', price: 1001, network: 'AIRTEL', category: 'SME', validity: '2 Days' },
    { productCode: 'airtel_3_5gb7_days', name: 'AIRTEL 3.5GB/7 Days', price: 1456, network: 'AIRTEL', category: 'SME', validity: '7 Days' },
    { productCode: 'airtel_5gb2_days', name: 'AIRTEL 5GB/2 Days', price: 1456, network: 'AIRTEL', category: 'SME', validity: '2 Days' },
    { productCode: 'airtel_300mb2_days', name: 'AIRTEL 300mb/2 Days', price: 118.3, network: 'AIRTEL', category: 'SME', validity: '2 Days' },
    { productCode: 'airtel_150mb1_day', name: 'AIRTEL 150mb/1 Day', price: 60.06, network: 'AIRTEL', category: 'SME', validity: '1 Day' },
    { productCode: 'airtel_1_5gb7_days_social_bundle', name: 'AIRTEL 1.5GB/7 DAYS SOCIAL BUNDLE', price: 486.85, network: 'AIRTEL', category: 'SME', validity: '7 Days' },
    { productCode: 'airtel_1gb3_days_social_bundle', name: 'AIRTEL 1GB/3 DAYS SOCIAL BUNDLE', price: 295.75, network: 'AIRTEL', category: 'SME', validity: '3 Days' },
    { productCode: 'airtel_9gb7_days', name: 'AIRTEL 9GB/7 Days', price: 2598.05, network: 'AIRTEL', category: 'SME', validity: '7 Days' },
    { productCode: 'airtel_1_5gb1_day', name: 'AIRTEL 1.5GB/1 Day', price: 395.85, network: 'AIRTEL', category: 'SME', validity: '1 Day' },
    { productCode: 'airtel_4gb2_days', name: 'AIRTEL 4GB/2 Days', price: 819, network: 'AIRTEL', category: 'SME', validity: '2 Days' },
    { productCode: 'airtel_13gb30_days', name: 'AIRTEL 13GB/30 Days', price: 5460, network: 'AIRTEL', category: 'SME', validity: '30 Days' },
    { productCode: 'airtel_8gb30_days', name: 'AIRTEL 8gb/30 Days', price: 2002, network: 'AIRTEL', category: 'SME', validity: '30 Days' },
    { productCode: 'airtel_60gb60_days', name: 'AIRTEL 60gb/60 Days', price: 10010, network: 'AIRTEL', category: 'SME', validity: '60 Days' },
    { productCode: 'airtel_2gb2_days', name: 'AIRTEL 2gb/2 Days', price: 618.8, network: 'AIRTEL', category: 'SME', validity: '2 Days' },
    { productCode: 'airtel_3gb2_days', name: 'AIRTEL 3gb/2 Days', price: 809.9, network: 'AIRTEL', category: 'SME', validity: '2 Days' },

    // GLO AWOOF
    { productCode: 'glo_750mb1_day', name: 'GLO 750MB/1 DAY', price: 184, network: 'GLO', category: 'AWOOF', validity: '1 Day' },
    { productCode: 'glo_1_5gb1_day', name: 'GLO 1.5GB/1 DAY', price: 276, network: 'GLO', category: 'AWOOF', validity: '1 Day' },
    { productCode: 'glo_2_5gb2_days', name: 'GLO 2.5GB/2 DAYS', price: 460, network: 'GLO', category: 'AWOOF', validity: '2 Days' },
    { productCode: 'glo_10gb7_days', name: 'GLO 10GB/7 DAYS', price: 1840, network: 'GLO', category: 'AWOOF', validity: '7 Days' },

    // MTN AWOOF
    { productCode: 'mtn_1gb1_day_plan', name: 'MTN 1GB/1 Day plan', price: 480, network: 'MTN', category: 'AWOOF', validity: '1 Day' },
    { productCode: 'mtn_3_2gb2_days_plan', name: 'MTN 3.2GB/2 Days plan', price: 960, network: 'MTN', category: 'AWOOF', validity: '2 Days' },
    { productCode: 'mtn_2_5gb2_days', name: 'MTN 2.5GB/2 Days', price: 864, network: 'MTN', category: 'AWOOF', validity: '2 Days' },
    { productCode: 'mtn_2gb2_days', name: 'MTN 2GB/2 Days', price: 720, network: 'MTN', category: 'AWOOF', validity: '2 Days' },
    { productCode: 'mtn_750mb3_days', name: 'MTN 750MB/3 Days', price: 432, network: 'MTN', category: 'AWOOF', validity: '3 Days' },
    { productCode: 'mtn_1gb7_days', name: 'MTN 1GB/7 Days', price: 768, network: 'MTN', category: 'AWOOF', validity: '7 Days' },
    { productCode: 'mtn_1_5gb7_days', name: 'MTN 1.5GB/7 Days', price: 960, network: 'MTN', category: 'AWOOF', validity: '7 Days' },
    { productCode: 'mtn_1_2gb7_days', name: 'MTN 1.2GB/7 Days', price: 720, network: 'MTN', category: 'AWOOF', validity: '7 Days' },
    { productCode: 'mtn_6gb7_days', name: 'MTN 6GB/7 Days', price: 2400, network: 'MTN', category: 'AWOOF', validity: '7 Days' },
    { productCode: 'mtn_11gb7_days', name: 'MTN 11GB/7 Days', price: 3360, network: 'MTN', category: 'AWOOF', validity: '7 Days' },
    { productCode: 'mtn_110mb1_day', name: 'MTN 110MB/1 Day', price: 96, network: 'MTN', category: 'AWOOF', validity: '1 Day' },
    { productCode: 'mtn_230mb1_day', name: 'MTN 230MB/1 Day', price: 192, network: 'MTN', category: 'AWOOF', validity: '1 Day' },
    { productCode: 'mtn_500mb7_days', name: 'MTN 500MB/7 Days', price: 480, network: 'MTN', category: 'AWOOF', validity: '7 Days' },
    { productCode: '6_75gb_xtra-special30_days', name: '6.75GB XTRA-SPECIAL:30 DAYS', price: 2880, network: 'MTN', category: 'AWOOF', validity: '30 Days' },
    { productCode: '14_5gb_xtra-special30_days', name: '14.5GB XTRA-SPECIAL:30 DAYS', price: 4800, network: 'MTN', category: 'AWOOF', validity: '30 Days' },
    { productCode: 'mtn_1_5gb2_days', name: 'MTN 1.5GB/2 Days', price: 576, network: 'MTN', category: 'AWOOF', validity: '2 Days' },
    { productCode: '1_8gb_thryvedata30_days', name: '1.8GB ThryveData:30 DAYS', price: 1440, network: 'MTN', category: 'AWOOF', validity: '30 Days' },
    { productCode: 'mtn_1_2gb_all_social_30_days', name: 'MTN 1.2GB All Social /30 Days', price: 432, network: 'MTN', category: 'AWOOF', validity: '30 Days' },
    { productCode: 'mtn_20gb7_days', name: 'MTN 20GB/7 Days', price: 4800, network: 'MTN', category: 'AWOOF', validity: '7 Days' },
    { productCode: 'mtn_500mb1_day', name: 'MTN 500MB/1 Day', price: 336, network: 'MTN', category: 'AWOOF', validity: '1 Day' },
    { productCode: 'mtn_2_5gb1_day', name: 'MTN 2.5GB/1 Day', price: 720, network: 'MTN', category: 'AWOOF', validity: '1 Day' },
    { productCode: 'mtn_3_5gb7_days_plan', name: 'MTN 3.5GB/7 Days plan', price: 1440, network: 'MTN', category: 'AWOOF', validity: '7 Days' },
    { productCode: 'mtn_1gb1_day_lte', name: 'MTN 1GB/1 DAY LTE', price: 255.36, network: 'MTN', category: 'AWOOF', validity: '1 Day' },
    { productCode: 'mtn_2_5gb1_day_lte', name: 'MTN 2.5GB/1 DAY LTE', price: 555.84, network: 'MTN', category: 'AWOOF', validity: '1 Day' },

    // AIRTEL SME LTE
    { productCode: 'airtel_1gb7_days_lite', name: 'AIRTEL 1GB/7 DAYS LITE', price: 779, network: 'AIRTEL', category: 'SME_LITE', validity: '7 Days' },
    { productCode: 'airtel_2gb30_days_lite', name: 'AIRTEL 2GB/30 DAYS LITE', price: 1558, network: 'AIRTEL', category: 'SME_LITE', validity: '30 Days' },
    { productCode: 'airtel_3gb30_days_lite', name: 'AIRTEL 3GB/30 DAYS LITE', price: 2337, network: 'AIRTEL', category: 'SME_LITE', validity: '30 Days' },
    { productCode: 'airtel_8gb30_days_lite', name: 'AIRTEL 8GB/30 DAYS LITE', price: 6232, network: 'AIRTEL', category: 'SME_LITE', validity: '30 Days' },
    { productCode: 'airtel_10gb30_days_lite', name: 'AIRTEL 10GB/30 DAYS LITE', price: 7790, network: 'AIRTEL', category: 'SME_LITE', validity: '30 Days' },
  ];

  // Batch Upsert Data Plans
  console.log(`⏳ Seeding ${dataPlans.length} Data Plans...`);
  
  for (const plan of dataPlans) {
    await prisma.dataPlan.upsert({
      where: { productCode: plan.productCode },
      update: { 
        price: plan.price,
        name: plan.name,
        category: plan.category,
        validity: plan.validity
      },
      create: {
        productCode: plan.productCode,
        network: plan.network,
        category: plan.category,
        name: plan.name,
        price: plan.price,
        validity: plan.validity,
        isActive: true
      }
    });
  }

  console.log('✅ Services & Data Plans seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
