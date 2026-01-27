import axios from 'axios';

// Use the token you provided
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
      timeout: 60000 
    });

    const apiRes = response.data;
    console.log("S8V Submit Response:", JSON.stringify(apiRes, null, 2));

    // FIX: The provider returns "success" as a STRING message, not a boolean true.
    // We check if 'success' key exists and has content.
    const isSuccess = 
        apiRes.status === true || 
        apiRes.status === 'success' || 
        apiRes.success === true ||
        (typeof apiRes.success === 'string' && apiRes.success.includes('successfully'));

    if (isSuccess) {
      return { 
        success: true, 
        message: (typeof apiRes.success === 'string' ? apiRes.success : apiRes.message) || 'Submitted successfully',
        data: apiRes 
      };
    }

    return { 
      success: false, 
      message: apiRes.message || apiRes.error || 'Provider rejected request' 
    };

  } catch (error: any) {
    console.error("S8V Submit Error:", error.response?.data || error.message);
    
    // Extract error message safely
    let errorMsg = 'Connection failed';
    if (error.response?.data?.error) {
        if (typeof error.response.data.error === 'object') {
            // Handle { error: { tracking_id: ["Invalid format"] } }
            errorMsg = JSON.stringify(error.response.data.error);
        } else {
            errorMsg = error.response.data.error;
        }
    }

    return { 
      success: false, 
      message: errorMsg
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
    
    // MAP EXTERNAL STATUS TO INTERNAL
    // SUCCESS
    if (statusStr === 'success' || statusStr === 'successful' || statusStr === 'completed') {
      return { 
        success: true, 
        status: 'COMPLETED', 
        data: apiRes.data || apiRes 
      };
    }

    // FAILED
    if (statusStr === 'failed' || statusStr === 'rejected') {
      return { 
        success: true, 
        status: 'FAILED', 
        message: apiRes.message || 'Clearance Rejected' 
      };
    }

    // STILL PROCESSING
    return { 
      success: true, 
      status: 'PROCESSING', 
      message: 'Still processing at provider' 
    };

  } catch (error: any) {
    console.error("S8V Status Check Error:", error.response?.data || error.message);
    
    if (error.response?.status === 404) {
        return { success: false, message: 'Tracking ID not found at provider' };
    }
    
    return { success: false, message: 'Network check failed' };
  }
}
