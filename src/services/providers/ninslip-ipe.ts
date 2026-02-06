import axios from 'axios';

// --- CONFIGURATION ---
const API_KEY = process.env.ROBOSTTECH_API_KEY;
const SUBMIT_URL = 'https://robosttech.com/api/clearance';
const STATUS_URL = 'https://robosttech.com/api/clearance_status';

export interface IpeResult {
  success: boolean;
  message?: string;
  reply?: string; // <--- ADDED: To match your documentation
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
    const isSuccess = 
        apiRes.status === true || 
        apiRes.status === 'success' || 
        apiRes.success === true;

    const msg = apiRes.message || 'Submitted successfully';

    if (isSuccess) {
      return { 
        success: true, 
        message: msg,
        reply: msg, // <--- Mapped to reply
        data: apiRes 
      };
    }

    return { 
      success: false, 
      message: apiRes.message || apiRes.error || 'Provider rejected request',
      reply: apiRes.message || apiRes.error || 'Provider rejected request' // <--- Mapped to reply
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

    return { success: false, message: errorMsg, reply: errorMsg };
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
    
    // Default message fallback
    const displayMessage = apiRes.message || 'Processing...';

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
        message: displayMessage,
        reply: displayMessage // <--- Mapped for docs
      };
    }

    // B. FAILED / REJECTED
    if (
        statusStr === 'failed' || 
        statusStr === 'rejected' || 
        msgStr.includes('not found')
    ) {
      return { 
        success: true, 
        status: 'FAILED', 
        message: displayMessage,
        reply: displayMessage // <--- Mapped for docs
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
            message: 'Provider is processing clearance...',
            reply: 'Provider is processing clearance...'
         };
    }

    // D. Default Fallback
    return { 
      success: true, 
      status: 'PROCESSING', 
      message: displayMessage,
      reply: displayMessage
    };

  } catch (error: any) {
    console.error("Robost Status Check Error:", error.response?.data || error.message);
    return { success: false, message: 'Network check failed', reply: 'Network check failed' };
  }
}
