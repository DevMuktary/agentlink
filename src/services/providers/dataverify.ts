import axios from 'axios';

const DATAVERIFY_API_KEY = process.env.DATAVERIFY_API_KEY;
const ENDPOINT = "https://dataverify.com.ng/developers/nin_slips/vnin_slip.php";

export interface VninResult {
  success: boolean;
  data?: any; // Contains pdf_base64
  error?: string;
}

export async function generateVninSlip(nin: string): Promise<VninResult> {
  if (!DATAVERIFY_API_KEY) {
    console.error("CRITICAL: DATAVERIFY_API_KEY is missing.");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const response = await axios.post(
      ENDPOINT,
      {
        api_key: DATAVERIFY_API_KEY,
        nin: nin
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 60s timeout for PDF generation
      }
    );

    const apiRes = response.data;

    if (apiRes.status === 'success' && apiRes.pdf_base64) {
      return { success: true, data: apiRes };
    } else {
      return { success: false, error: apiRes.message || 'Slip generation failed.' };
    }

  } catch (error: any) {
    console.error('DataVerify Error:', error.message);
    if (error.code === 'ECONNABORTED') return { success: false, error: 'Service Timed Out' };
    return { success: false, error: 'Provider connection failed.' };
  }
}
