import axios from 'axios';

const API_KEY = process.env.SLIPAPI_KEY; // Add this to your .env file
const BASE_URL = 'https://slipapi.com/developers/nin_slips';

export type SlipTier = 'PREMIUM' | 'STANDARD' | 'REGULAR';

interface SlipResult {
  success: boolean;
  data?: string; // The Base64 PDF string
  error?: string;
}

export async function generateSlipV2(
  identifier: string,
  tier: SlipTier,
  method: 'NIN' | 'PHONE'
): Promise<SlipResult> {
  
  if (!API_KEY) {
    console.error("CRITICAL: SLIPAPI_KEY is missing in .env");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    // 1. Construct URL based on Tier and Method
    // Example: NIN + PREMIUM -> nin_premium.php
    // Example: PHONE + STANDARD -> nin_standard_phone.php
    
    let endpoint = '';
    const tierSlug = tier.toLowerCase(); // premium, standard, or regular

    if (method === 'NIN') {
        endpoint = `nin_${tierSlug}.php`;
    } else {
        endpoint = `nin_${tierSlug}_phone.php`;
    }

    const url = `${BASE_URL}/${endpoint}`;

    // 2. Construct Payload
    // The API expects 'nin' key for NIN requests, and 'phone' key for Phone requests
    const payload: any = {
        api_key: API_KEY
    };

    if (method === 'NIN') {
        payload.nin = identifier;
    } else {
        payload.phone = identifier;
    }

    // 3. Make Request
    console.log(`[SlipV2] Requesting ${tier} via ${method} -> ${url}`);
    
    const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 60s timeout for generation
    });

    const apiRes = response.data;

    // 4. Validate Response
    if (apiRes.status === 'success' && apiRes.pdf_base64) {
        return {
            success: true,
            data: apiRes.pdf_base64
        };
    }

    // Handle API Error Message
    return {
        success: false,
        error: apiRes.message || 'Slip generation failed'
    };

  } catch (error: any) {
    console.error("SlipV2 Error:", error.response?.data || error.message);
    return { 
        success: false, 
        error: error.response?.data?.message || 'Connection to Slip Provider Failed' 
    };
  }
}
