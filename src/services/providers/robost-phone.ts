import axios from 'axios';

const ROBOST_API_KEY = process.env.ROBOSTTECH_API_KEY;
const ENDPOINT = "https://robosttech.com/api/nin_phone";

export interface PhoneLookupResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function lookupNinByPhone(phone: string): Promise<PhoneLookupResult> {
  if (!ROBOST_API_KEY) {
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const response = await axios.post(
      ENDPOINT,
      { phone },
      {
        headers: { 
          'api-key': ROBOST_API_KEY, // Header 2: Strictly for Phone Lookup
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
