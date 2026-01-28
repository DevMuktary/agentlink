import axios from 'axios';

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
    const payload = { token: API_TOKEN, tracking_id: trackingId };
    console.log("Submitting to S8V:", JSON.stringify(payload, null, 2));

    const response = await axios.post(SUBMIT_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000 
    });

    const apiRes = response.data;
    console.log("S8V Submit Response:", JSON.stringify(apiRes, null, 2));

    // Logic: Check if success is true OR if 'success' string exists
    const isSuccess = 
        apiRes.status === true || 
        apiRes.status === 'success' || 
        apiRes.success === true ||
        (typeof apiRes.success === 'string' && apiRes.success.includes('successfully'));

    if (isSuccess) {
      return { 
        success: true, 
        message: 'Submitted successfully',
        data: apiRes 
      };
    }

    return { 
      success: false, 
      message: apiRes.message || apiRes.error || 'Provider rejected request' 
    };

  } catch (error: any) {
    console.error("S8V Submit Error:", error.response?.data || error.message);
    
    let errorMsg = 'Connection failed';
    if (error.response?.data?.error) {
        // Handle { error: { tracking_id: ["Invalid format"] } }
        errorMsg = typeof error.response.data.error === 'object' 
            ? JSON.stringify(error.response.data.error) 
            : error.response.data.error;
    }

    return { success: false, message: errorMsg };
  }
}

// 2. Check IPE Status
export async function checkIpeStatus(trackingId: string): Promise<IpeResult> {
  try {
    const payload = { token: API_TOKEN, tracking_id: trackingId };
    
    const response = await axios.post(STATUS_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    });

    const apiRes = response.data;
    console.log("S8V Status Response:", JSON.stringify(apiRes, null, 2));

    const statusStr = (apiRes.status || '').toString().toLowerCase();

    // --- MAP STATUS ---

    // A. SUCCESS / COMPLETED
    if (statusStr === 'success' || statusStr === 'successful' || statusStr === 'completed') {
      return { 
        success: true, 
        status: 'COMPLETED', 
        data: apiRes.data || apiRes // Pass full data
      };
    }

    // B. FAILED / REJECTED
    if (statusStr === 'failed' || statusStr === 'rejected') {
      return { 
        success: true, 
        status: 'FAILED', 
        message: apiRes.message || 'Clearance Rejected' 
      };
    }

    // C. IN PROGRESS (Explicit Check)
    if (statusStr === 'in-progress' || statusStr === 'processing' || statusStr === 'pending') {
         return { 
            success: true, 
            status: 'PROCESSING', 
            message: 'Provider is processing clearance...' 
         };
    }

    // D. Default Fallback
    return { 
      success: true, 
      status: 'PROCESSING', 
      message: 'Waiting for provider response...' 
    };

  } catch (error: any) {
    console.error("S8V Status Check Error:", error.response?.data || error.message);
    return { success: false, message: 'Network check failed' };
  }
}
