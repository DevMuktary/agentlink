import axios from 'axios';

const API_KEY = process.env.CHEAPDATA_API_KEY;
const BASE_URL = 'https://cheapdatasales.com/autobiz_vending_index.php';

export interface DataResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export async function purchaseData(
  productCode: string, 
  phoneNumber: string, 
  reference: string
): Promise<DataResult> {
  
  if (!API_KEY) {
    console.error("CRITICAL: CHEAPDATA_API_KEY is missing.");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    // Payload structure matches the provider's documentation
    const payload = {
      product_code: productCode,
      phone_number: phoneNumber,
      action: 'vend',
      user_reference: reference,
      bypass_network: 'yes' // Skipping strict network check for speed
    };

    const response = await axios.post(BASE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Bearer': API_KEY
      },
      timeout: 60000 // 60s timeout for data
    });

    const apiRes = response.data;

    // Check for success (Provider usually returns status: true)
    if (apiRes.status === true || apiRes.text_status === 'COMPLETED') {
      return {
        success: true,
        message: apiRes.server_message || 'Data Sent Successfully',
        data: {
          product_code: productCode,
          phone: phoneNumber,
          provider_ref: apiRes.data?.recharge_id,
          balance_after: apiRes.data?.after_balance,
          description: apiRes.data?.true_response
        }
      };
    }

    return {
      success: false,
      error: apiRes.server_message || 'Transaction Failed'
    };

  } catch (error: any) {
    if (error.response) {
       console.error("CheapData Data Error:", error.response.data);
       return { success: false, error: error.response.data.server_message || 'Provider Error' };
    }
    console.error("CheapData Connection Error:", error.message);
    return { success: false, error: 'Connection Failed' };
  }
}
