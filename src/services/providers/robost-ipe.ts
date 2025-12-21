import axios from 'axios';

const ROBOST_API_KEY = process.env.ROBOSTTECH_API_KEY;
const SUBMIT_URL = 'https://robosttech.com/api/clearance';
const STATUS_URL = 'https://robosttech.com/api/clearance_status';

export interface IpeResult {
  success: boolean;
  message?: string;
  data?: any;
  status?: 'COMPLETED' | 'FAILED' | 'PROCESSING';
}

// 1. Submit Request
export async function submitIpeRequest(trackingId: string): Promise<IpeResult> {
  if (!ROBOST_API_KEY) return { success: false, message: 'Config Error' };

  try {
    const response = await axios.post(SUBMIT_URL, 
      { tracking_id: trackingId },
      { headers: { 'api-key': ROBOST_API_KEY, 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    const data = response.data;
    if (data.success || response.status === 200) {
      return { success: true, message: data.message || 'Submitted successfully' };
    }
    return { success: false, message: data.message || 'Provider rejected request' };

  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Submission failed' };
  }
}

// 2. Check Status (For Cron)
export async function checkIpeStatus(trackingId: string): Promise<IpeResult> {
  if (!ROBOST_API_KEY) return { success: false, message: 'Config Error' };

  try {
    const response = await axios.post(STATUS_URL, 
      { tracking_id: trackingId },
      { headers: { 'api-key': ROBOST_API_KEY, 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    const data = response.data;
    
    // Logic from your uploaded file
    if (data.success === true || data.status === 'success' || (data.reply && !data.error)) {
        return { success: true, status: 'COMPLETED', data: data };
    }
    
    // Check for explicit failure keywords
    const msg = (data.message || "").toLowerCase();
    if (msg.includes("fail") || msg.includes("invalid") || msg.includes("reject")) {
        return { success: true, status: 'FAILED', message: data.message };
    }

    return { success: true, status: 'PROCESSING', message: 'Still pending' };

  } catch (error: any) {
    return { success: false, message: 'Check failed' };
  }
}
