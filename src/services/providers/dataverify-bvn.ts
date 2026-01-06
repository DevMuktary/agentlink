import axios from 'axios';

// Add DATAVERIFY_API_KEY to your Railway Variables
const API_KEY = process.env.DATAVERIFY_API_KEY;
const ENDPOINT = 'https://dataverify.com.ng/developers/bvn_slip/bvn_premium.php';

export interface BvnSlipResult {
  success: boolean;
  message?: string;
  data?: any;
  pdf_base64?: string;
  error?: string;
}

export async function generateBvnPremiumSlip(bvn: string): Promise<BvnSlipResult> {
  if (!API_KEY) {
    console.error("CRITICAL: DATAVERIFY_API_KEY is missing.");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const response = await axios.post(
      ENDPOINT,
      { 
        api_key: API_KEY, 
        bvn: bvn 
      },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 45000 
      }
    );

    const apiRes = response.data;

    // DataVerify Success Condition: status="success" OR response_code="00"
    if (apiRes.status === 'success' || apiRes.response_code === '00') {
      return {
        success: true,
        message: 'Slip Generated Successfully',
        data: apiRes.user_data, // The details (Name, DOB, etc)
        pdf_base64: apiRes.pdf_base64 // The PDF string
      };
    }

    return {
      success: false,
      error: apiRes.message || 'Record not found or Provider Error'
    };

  } catch (error: any) {
    if (error.response) {
       console.error("DataVerify Error:", error.response.data);
       return { success: false, error: error.response.data.message || 'Provider Rejected Request' };
    }
    console.error("DataVerify Connection Error:", error.message);
    return { success: false, error: 'Connection Failed' };
  }
}
