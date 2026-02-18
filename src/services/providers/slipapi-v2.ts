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
    console.error("CRITICAL: SLIPAPI_KEY is missing in .env");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const tierSlug = tier.toLowerCase(); // premium, standard, or regular
    let endpoint = '';
    
    // 1. Construct Payload
    const payload: any = {
        api_key: API_KEY
    };

    if (method === 'NIN') {
        // --- NIN METHOD ---
        // URL Example: https://slipapi.com/developers/nin_slips/nin_premium
        endpoint = `nin_${tierSlug}`;
        payload.nin = identifier;
    } else {
        // --- PHONE METHOD ---
        // URL Example: https://slipapi.com/developers/nin_slips/nin_premium_phone
        endpoint = `nin_${tierSlug}_phone`;
        
        // Sending BOTH keys to cover documentation conflicts
        // Docs say 'phone', PHP example says 'nin'. We send both.
        payload.phone = identifier;
        payload.nin = identifier; 
    }

    const url = `${BASE_URL}/${endpoint}`;

    console.log(`[SlipV2] Requesting ${url} | ID: ${identifier}`);
    
    // 2. Make Request
    const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 
    });

    const apiRes = response.data;

    // 3. Validate Response
    if (apiRes.status === 'success' && apiRes.pdf_base64) {
        return {
            success: true,
            data: apiRes.pdf_base64
        };
    }

    // 4. Handle Errors
    console.error(`[SlipV2] Provider Error:`, apiRes);
    return {
        success: false,
        error: apiRes.message || 'Slip generation failed'
    };

  } catch (error: any) {
    console.error("SlipV2 Connection Error:", error.response?.data || error.message);
    return { 
        success: false, 
        error: error.response?.data?.message || 'Connection to Slip Provider Failed' 
    };
  }
}
