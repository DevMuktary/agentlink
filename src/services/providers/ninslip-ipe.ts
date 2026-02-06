import axios from 'axios';

// --- CONFIGURATION ---
// Ensure you add ROBOST_API_KEY to your .env file
const API_KEY = process.env.ROBOSTTECH_API_KEY;
const SUBMIT_URL = 'https://robosttech.com/api/clearance';
const STATUS_URL = 'https://robosttech.com/api/clearance_status';

export interface IpeResult {
  success: boolean;
  message?: string;
  data?: any;
  status?: 'COMPLETED' | 'FAILED' | 'PROCESSING';
}

// 1. Submit IPE Request
export async function submitIpeRequest(trackingId: string): Promise<IpeResult> {
  try {
    const payload = { tracking_id: trackingId };
    
    console.log("Submitting to Robost:", JSON.stringify(payload, null, 2));

    const response = await axios.post(SUBMIT_URL, payload, {
      headers: { 
        'Content-Type': 'application/json',
        'api-key': API_KEY 
      },
      timeout: 60000 
    });

    const apiRes = response.data;
    console.log("Robost Submit Response:", JSON.stringify(apiRes, null, 2));

    // Logic: Robost usually returns success: true or status: 'success'
    // We check broadly to be safe
    const isSuccess = 
        apiRes.status === true || 
        apiRes.status === 'success' || 
        apiRes.success === true;

    if (isSuccess) {
      return { 
        success: true, 
        message: apiRes.message || 'Submitted successfully',
        data: apiRes 
      };
    }

    return { 
      success: false, 
      message: apiRes.message || apiRes.error || 'Provider rejected request' 
    };

  } catch (error: any) {
    console.error("Robost Submit Error:", error.response?.data || error.message);
    
    let errorMsg = 'Connection failed';
    if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
    } else if (error.response?.data?.error) {
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
    const payload = { tracking_id: trackingId };
    
    const response = await axios.post(STATUS_URL, payload, {
      headers: { 
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      timeout: 60000
    });

    const apiRes = response.data;
    console.log("Robost Status Response:", JSON.stringify(apiRes, null, 2));

    const statusStr = (apiRes.status || '').toString().toLowerCase();
    const msgStr = (apiRes.message || '').toLowerCase();

    // --- MAP STATUS ---

    // A. SUCCESS / COMPLETED
    if (
        statusStr === 'success' || 
        statusStr === 'successful' || 
        statusStr === 'completed' ||
        statusStr === 'cleared'
    ) {
      return { 
        success: true, 
        status: 'COMPLETED', 
        data: apiRes.data || apiRes,
        message: apiRes.message || 'Clearance Successful'
      };
    }

    // B. FAILED / REJECTED
    if (
        statusStr === 'failed' || 
        statusStr === 'rejected' || 
        msgStr.includes('not found') // Sometimes invalid IDs return 200 but say not found
    ) {
      return { 
        success: true, // Request finished, but result is negative
        status: 'FAILED', 
        message: apiRes.message || 'Clearance Rejected' 
      };
    }

    // C. IN PROGRESS
    if (
        statusStr === 'in-progress' || 
        statusStr === 'processing' || 
        statusStr === 'pending'
    ) {
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
      message: apiRes.message || 'Waiting for provider response...' 
    };

  } catch (error: any) {
    console.error("Robost Status Check Error:", error.response?.data || error.message);
    return { success: false, message: 'Network check failed' };
  }
}
