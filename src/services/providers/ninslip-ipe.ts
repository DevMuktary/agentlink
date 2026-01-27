import axios from 'axios';

// Use the token you provided (Add S8V_API_TOKEN to your .env for security)
const API_TOKEN = process.env.S8V_API_TOKEN || "kprAMi3frffX9CFA21mFKTgi4teaylY4aEiHBshRLhrbQ0vxOb";
const SUBMIT_URL = 'https://www.s8v.ng/api/clearance';
const STATUS_URL = 'https://www.s8v.ng/api/clearance/status';

export interface IpeResult {
  success: boolean;
  message?: string;
  data?: any;
  status?: 'COMPLETED' | 'FAILED' | 'PROCESSING';
}

// 1. Submit IPE Request
export async function submitIpeRequest(trackingId: string): Promise<IpeResult> {
  try {
    const payload = {
      token: API_TOKEN,
      tracking_id: trackingId
    };

    console.log("Submitting to S8V:", JSON.stringify(payload, null, 2));

    const response = await axios.post(SUBMIT_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000 // 60s timeout
    });

    const apiRes = response.data;
    console.log("S8V Submit Response:", JSON.stringify(apiRes, null, 2));

    // Adjust these checks based on S8V's actual success response structure
    // Assuming standard JSON { status: true/success, ... }
    if (apiRes.status === true || apiRes.status === 'success' || apiRes.success === true) {
      return { 
        success: true, 
        message: apiRes.message || 'Submitted successfully',
        data: apiRes 
      };
    }

    return { 
      success: false, 
      message: apiRes.message || 'Provider rejected request' 
    };

  } catch (error: any) {
    console.error("S8V Submit Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Connection failed' 
    };
  }
}

// 2. Check IPE Status
export async function checkIpeStatus(trackingId: string): Promise<IpeResult> {
  try {
    const payload = {
        token: API_TOKEN,
        tracking_id: trackingId
    };

    const response = await axios.post(STATUS_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    });

    const apiRes = response.data;
    console.log("S8V Status Response:", JSON.stringify(apiRes, null, 2));

    const statusStr = (apiRes.status || '').toString().toLowerCase();
    const msgStr = (apiRes.message || '').toString().toLowerCase();

    // MAP EXTERNAL STATUS TO INTERNAL
    // SUCCESS
    if (statusStr === 'success' || statusStr === 'successful' || statusStr === 'completed') {
      return { 
        success: true, 
        status: 'COMPLETED', 
        data: apiRes.data || apiRes // Pass full data
      };
    }

    // FAILED
    if (statusStr === 'failed' || statusStr === 'rejected') {
      return { 
        success: true, // Request succeeded, but result is "Failed"
        status: 'FAILED', 
        message: apiRes.message || 'Clearance Rejected' 
      };
    }

    // STILL PROCESSING (Default fallback)
    return { 
      success: true, 
      status: 'PROCESSING', 
      message: 'Still processing at provider' 
    };

  } catch (error: any) {
    console.error("S8V Status Check Error:", error.response?.data || error.message);
    
    // Treat 404 as "Not Found" or "Processing" depending on provider behavior
    if (error.response?.status === 404) {
        return { success: false, message: 'Tracking ID not found at provider' };
    }
    
    return { success: false, message: 'Network check failed' };
  }
}
