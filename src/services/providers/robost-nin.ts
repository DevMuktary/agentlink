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
      { nin }, // Ensure this matches RobostTech documentation exactly
      {
        headers: { 
          'Authorization': `Bearer ${ROBOST_API_KEY}`, // TRY THIS: Some Robost endpoints use Bearer
          'api-key': ROBOST_API_KEY, // Keep this as backup/alternative
          'Content-Type': 'application/json' 
        },
        timeout: 60000 
      }
    );

    const apiRes = response.data;

    if (apiRes.success || apiRes.status === 'success' || apiRes.data) {
      return { success: true, data: apiRes.data || apiRes };
    } else {
      return { success: false, error: apiRes.message || 'Verification failed' };
    }

  } catch (error: any) {
    // Enhanced Error Logging
    if (error.response) {
        console.error('RobostTech Response Error:', JSON.stringify(error.response.data));
        return { success: false, error: error.response.data.message || `Provider Error: ${error.response.status}` };
    }
    console.error('RobostTech Network Error:', error.message);
    return { success: false, error: 'Service Timed Out or Network Error' };
  }
}
