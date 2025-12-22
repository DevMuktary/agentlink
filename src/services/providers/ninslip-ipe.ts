import axios from 'axios';

// Ensure you add NINSLIP_API_KEY to your Railway Variables
const API_KEY = process.env.NINSLIP_API_KEY;
const SUBMIT_URL = 'https://api.ninslip.com/ipe_clearance/';
const STATUS_URL = 'https://api.ninslip.com/ipe_clearance/status.php';

export interface IpeResult {
  success: boolean;
  message?: string;
  data?: any;
  status?: 'COMPLETED' | 'FAILED' | 'PROCESSING';
}

// 1. Submit Request
export async function submitIpeRequest(trackingId: string): Promise<IpeResult> {
  if (!API_KEY) {
    console.error("CRITICAL: NINSLIP_API_KEY is missing.");
    return { success: false, message: 'Service Configuration Error' };
  }

  try {
    const response = await axios.post(
      SUBMIT_URL, 
      { tracking_id: trackingId },
      { 
        headers: { 
          'Authorization': `Bearer ${API_KEY}`, 
          'Content-Type': 'application/json' 
        }, 
        timeout: 45000 
      }
    );

    const apiRes = response.data;

    // NinSlip success pattern
    if (apiRes.status === 'success') {
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
    console.error('NinSlip Submit Error:', error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Submission failed connection' 
    };
  }
}

// 2. Check Status (For Cron Job)
export async function checkIpeStatus(trackingId: string): Promise<IpeResult> {
  if (!API_KEY) return { success: false, message: 'Config Error' };

  try {
    const response = await axios.post(
      STATUS_URL, 
      { tracking_id: trackingId },
      { 
        headers: { 
          'Authorization': `Bearer ${API_KEY}`, 
          'Content-Type': 'application/json' 
        }, 
        timeout: 45000 
      }
    );

    const apiRes = response.data;

    // Case A: Success
    if (apiRes.status === 'success' && apiRes.clearance_status === 'Successful') {
      return { 
        success: true, 
        status: 'COMPLETED', 
        data: apiRes.data // Contains reply, name, dob etc.
      };
    }

    // Case B: Explicit Failure (Defensive coding based on standard API patterns)
    // If the provider sends a clear "Failed" status
    if (apiRes.status === 'failed' || apiRes.clearance_status === 'Failed' || apiRes.clearance_status === 'Rejected') {
      return { 
        success: true, 
        status: 'FAILED', 
        message: apiRes.message || 'Clearance Failed' 
      };
    }

    // Case C: Still Processing (Default)
    return { 
      success: true, 
      status: 'PROCESSING', 
      message: 'Waiting for provider...' 
    };

  } catch (error: any) {
    console.error('NinSlip Status Error:', error.message);
    return { success: false, message: 'Status check failed' };
  }
}
