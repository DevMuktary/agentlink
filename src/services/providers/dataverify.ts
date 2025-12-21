import axios from 'axios';

const DATAVERIFY_URL = 'https://dataverify.com.ng/developers/nin_slips/vnin_slip.php';
const API_KEY = process.env.DATAVERIFY_API_KEY;

export interface NinVerifyResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Validates a NIN using the DataVerify Provider.
 * This logic is isolated from the public API route.
 */
export async function verifyNinWithProvider(nin: string): Promise<NinVerifyResult> {
  if (!API_KEY) {
    console.error("CRITICAL: DATAVERIFY_API_KEY is missing in environment variables.");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const response = await axios.post(
      DATAVERIFY_URL,
      {
        api_key: API_KEY,
        nin: nin
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 45000 // 45 seconds timeout
      }
    );

    const apiData = response.data;

    // Check successful response patterns from DataVerify
    if (apiData.status === 'success' || apiData.success === true) {
      return {
        success: true,
        data: apiData
      };
    } else {
      return {
        success: false,
        error: apiData.message || 'Verification failed at provider.'
      };
    }

  } catch (error: any) {
    console.error('DataVerify Provider Error:', error.message);
    
    // Handle specific HTTP errors if needed
    if (error.response) {
        return { success: false, error: `Provider Error: ${error.response.status}` };
    }
    
    return { success: false, error: 'Service Timeout or Network Error' };
  }
}
