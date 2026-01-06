import axios from 'axios';

// Add CONFIRMIDENT_API_KEY to your Railway Variables
const API_KEY = process.env.CONFIRMIDENT_API_KEY;
const BASE_URL = 'https://confirmident.com.ng/api';

export interface BvnResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export async function verifyBvn(bvn: string): Promise<BvnResult> {
  if (!API_KEY) {
    console.error("CRITICAL: CONFIRMIDENT_API_KEY is missing.");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/bvn_search`,
      { bvn }, 
      {
        headers: {
          'api-key': API_KEY, // Specified in docs
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30s timeout
      }
    );

    const apiRes = response.data;

    // Check Success
    if (apiRes.success === true || apiRes.message === 'Verification Successfull') {
      return {
        success: true,
        message: 'Verification Successful',
        data: {
          // Normalize the fields (Fixing provider typos like "firs_tname")
          firstName: apiRes.data.firs_tname || apiRes.data.first_name,
          surname: apiRes.data.last_name,
          middleName: apiRes.data.middlename,
          dateOfBirth: apiRes.data.date_of_birth,
          phoneNumber: apiRes.data.phone_number,
          gender: apiRes.data.gender,
          stateOfOrigin: apiRes.data.State,
          bvn: apiRes.data.bvn,
          nin: apiRes.data.nin,
          photo: apiRes.data.image // Base64 image
        }
      };
    }

    return {
      success: false,
      error: apiRes.message || 'Verification Failed',
      data: apiRes
    };

  } catch (error: any) {
    // Handle Axios Errors
    if (error.response) {
      console.error("ConfirmIdent Error:", error.response.data);
      return { success: false, error: error.response.data.message || 'Provider Rejected Request' };
    }
    console.error("ConfirmIdent Connection Error:", error.message);
    return { success: false, error: 'Connection Failed' };
  }
}
