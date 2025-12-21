import axios from 'axios';

const ROBOST_API_KEY = process.env.ROBOSTTECH_API_KEY;
const ENDPOINT_NIN = "https://robosttech.com/api/nin_verify";
const ENDPOINT_PHONE = "https://robosttech.com/api/nin_phone";

export interface VerificationResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Verify by NIN (11 Digits)
 */
export async function verifyNinByNumber(nin: string): Promise<VerificationResult> {
  if (!ROBOST_API_KEY) {
    console.error("CRITICAL: ROBOSTTECH_API_KEY is missing.");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const response = await axios.post(
      ENDPOINT_NIN,
      { nin },
      {
        headers: { 
          'api-key': ROBOST_API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 60000 // 60s timeout as per your code
      }
    );

    const apiRes = response.data;

    if (apiRes.success && apiRes.data) {
      return { success: true, data: apiRes.data };
    } else {
      return { success: false, error: apiRes.message || 'Verification failed' };
    }

  } catch (error: any) {
    console.error('RobostTech NIN Error:', error.message);
    if (error.code === 'ECONNABORTED') return { success: false, error: 'Service Timed Out' };
    return { success: false, error: error.response?.data?.message || 'Provider Error' };
  }
}

/**
 * Verify by Phone Number
 */
export async function verifyNinByPhone(phone: string): Promise<VerificationResult> {
  if (!ROBOST_API_KEY) {
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const response = await axios.post(
      ENDPOINT_PHONE,
      { phone },
      {
        headers: { 
          'api-key': ROBOST_API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 60000
      }
    );

    const apiRes = response.data;

    if (apiRes.success && apiRes.data) {
      return { success: true, data: apiRes.data };
    } else {
      return { success: false, error: apiRes.message || 'Verification failed' };
    }

  } catch (error: any) {
    console.error('RobostTech Phone Error:', error.message);
    if (error.code === 'ECONNABORTED') return { success: false, error: 'Service Timed Out' };
    return { success: false, error: error.response?.data?.message || 'Provider Error' };
  }
}
