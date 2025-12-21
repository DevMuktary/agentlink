import axios from 'axios';

const ROBOST_API_KEY = process.env.ROBOSTTECH_API_KEY;
const ENDPOINT = "https://robosttech.com/api/nin_verify";

export interface NinLookupResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function lookupNinByNumber(nin: string): Promise<NinLookupResult> {
  if (!ROBOST_API_KEY) {
    console.error("CRITICAL: ROBOSTTECH_API_KEY is missing.");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const response = await axios.post(
      ENDPOINT,
      { nin },
      {
        headers: { 
          'api-key': ROBOST_API_KEY, // Header 1: Strictly for NIN Lookup
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
    console.error('RobostTech NIN Error:', error.message);
    if (error.code === 'ECONNABORTED') return { success: false, error: 'Service Timed Out' };
    return { success: false, error: error.response?.data?.message || 'Provider Error' };
  }
}
