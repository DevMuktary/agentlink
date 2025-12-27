import axios from 'axios';

const ROBOST_API_KEY = process.env.ROBOSTTECH_API_KEY;
// UPDATED ENDPOINT FROM YOUR DOCS
const ENDPOINT = "https://robosttech.com/api/nin_phone";

export interface NinLookupResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function lookupNinByPhone(phone: string): Promise<NinLookupResult> {
  if (!ROBOST_API_KEY) {
    console.error("CRITICAL: ROBOSTTECH_API_KEY is missing.");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const response = await axios.post(
      ENDPOINT,
      { phone: phone }, // Payload strictly matches docs: {"phone": "..."}
      {
        headers: { 
          'api-key': ROBOST_API_KEY, // Header strictly matches docs
          'Content-Type': 'application/json' 
        },
        timeout: 60000 
      }
    );

    const apiRes = response.data;

    if (apiRes.success === true || apiRes.status === 'success') {
      return { success: true, data: apiRes.data };
    } else {
      return { success: false, error: apiRes.message || 'Verification failed at provider.' };
    }

  } catch (error: any) {
    // Better Error Handling for 400/500 errors
    if (error.response) {
        console.error('RobostTech Phone Error:', JSON.stringify(error.response.data));
        const providerMsg = error.response.data?.message || error.response.data?.error;
        return { success: false, error: providerMsg || `Provider Error: ${error.response.status}` };
    }
    console.error('RobostTech Network Error:', error.message);
    return { success: false, error: 'Service Timed Out' };
  }
}
