import axios from 'axios';

// Add CHEAPDATA_API_KEY to your Railway Variables
const API_KEY = process.env.CHEAPDATA_API_KEY;
const BASE_URL = 'https://cheapdatasales.com/autobiz_vending_index.php';

export interface AirtimeResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// Map internal network names to Provider Product Codes
const PRODUCT_CODES: Record<string, string> = {
  'MTN': 'mtn_custom',
  'GLO': 'glo_custom',
  'AIRTEL': 'airtel_custom',
  '9MOBILE': 'etisalat_custom',
  'ETISALAT': 'etisalat_custom'
};

export async function purchaseAirtime(
  network: string, 
  amount: number, 
  phoneNumber: string, 
  reference: string
): Promise<AirtimeResult> {
  
  if (!API_KEY) {
    console.error("CRITICAL: CHEAPDATA_API_KEY is missing.");
    return { success: false, error: 'Service Configuration Error' };
  }

  const productCode = PRODUCT_CODES[network.toUpperCase()];
  if (!productCode) {
    return { success: false, error: 'Invalid Network Provider' };
  }

  try {
    const payload = {
      product_code: productCode,
      phone_number: phoneNumber,
      amount: amount,
      action: 'vend',
      user_reference: reference,
      bypass_network: 'yes' // As suggested to skip strict verification for speed
    };

    const response = await axios.post(BASE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Bearer': API_KEY // Using the specific header format from their docs
      },
      timeout: 45000
    });

    const apiRes = response.data;

    // Success Check based on their response structure
    if (apiRes.status === true || apiRes.text_status === 'COMPLETED') {
      return {
        success: true,
        message: apiRes.server_message || 'Airtime Sent Successfully',
        data: {
          network: network,
          amount: apiRes.data?.amount_charged || amount,
          phone: phoneNumber,
          provider_ref: apiRes.data?.recharge_id,
          balance_after: apiRes.data?.after_balance
        }
      };
    }

    return {
      success: false,
      error: apiRes.server_message || apiRes.data?.true_response || 'Transaction Failed'
    };

  } catch (error: any) {
    if (error.response) {
       console.error("CheapData Error:", error.response.data);
       return { success: false, error: error.response.data.server_message || 'Provider Error' };
    }
    console.error("CheapData Connection Error:", error.message);
    return { success: false, error: 'Connection Failed' };
  }
}
