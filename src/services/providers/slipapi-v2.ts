import axios from 'axios';

const API_KEY = process.env.SLIPAPI_KEY; 
const BASE_URL = 'https://slipapi.com/developers/nin_slips';

export type SlipTier = 'PREMIUM' | 'STANDARD' | 'REGULAR';

interface SlipResult {
  success: boolean;
  data?: string;
  error?: string;
}

export async function generateSlipV2(
  identifier: string,
  tier: SlipTier,
  method: 'NIN' | 'PHONE'
): Promise<SlipResult> {
  
  if (!API_KEY) {
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    // 1. Construct URL
    // Pattern: nin_premium.php OR nin_premium_phone.php
    const tierSlug = tier.toLowerCase(); // premium, standard, regular
    let endpoint = `nin_${tierSlug}.php`; // Default to NIN

    if (method === 'PHONE') {
        endpoint = `nin_${tierSlug}_phone.php`;
    }

    const url = `${BASE_URL}/${endpoint}`;

    // 2. Construct Payload
    // FIX: The provider's PHP example uses 'nin' as the key even for phone numbers.
    // To be safe, we send the identifier as 'nin' AND 'phone' AND 'phone_number'.
    // Extra keys are usually ignored by APIs, but missing ones cause errors.
    const payload: any = {
        api_key: API_KEY,
        nin: identifier,         // PHP example uses this key
        phone: identifier,       // Docs text says this
        phone_number: identifier // Common variation
    };

    // 3. Request
    console.log(`[SlipV2] Requesting ${url} | ID: ${identifier}`);
    
    const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 
    });

    const apiRes = response.data;
    console.log(`[SlipV2] Response:`, JSON.stringify(apiRes).substring(0, 100));

    if (apiRes.status === 'success' && apiRes.pdf_base64) {
        return {
            success: true,
            data: apiRes.pdf_base64
        };
    }

    return {
        success: false,
        error: apiRes.message || apiRes.error || 'Provider Validation Failed'
    };

  } catch (error: any) {
    console.error("SlipV2 Error:", error.response?.data || error.message);
    return { 
        success: false, 
        error: error.response?.data?.message || 'Connection to Slip Provider Failed' 
    };
  }
}
