import axios from 'axios';

const ROBOST_API_KEY = process.env.ROBOSTTECH_API_KEY;
const SUBMIT_URL = 'https://robosttech.com/api/personalization';
const STATUS_URL = 'https://robosttech.com/api/personalization_status';

export interface PersonalizationResult {
  success: boolean;
  message?: string;
  data?: any;
  status?: 'COMPLETED' | 'FAILED' | 'PROCESSING';
}

export async function submitPersonalization(trackingId: string): Promise<PersonalizationResult> {
  if (!ROBOST_API_KEY) return { success: false, message: 'Config Error' };

  try {
    const response = await axios.post(SUBMIT_URL, 
      { tracking_id: trackingId },
      { headers: { 'api-key': ROBOST_API_KEY, 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    const data = response.data;
    if (data.success === true) {
      return { success: true, message: 'Submitted successfully' };
    }
    return { success: false, message: data.message || 'Provider rejected request' };

  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Submission failed' };
  }
}

export async function checkPersonalizationStatus(trackingId: string): Promise<PersonalizationResult> {
  if (!ROBOST_API_KEY) return { success: false, message: 'Config Error' };

  try {
    const response = await axios.post(STATUS_URL, 
      { tracking_id: trackingId },
      { headers: { 'api-key': ROBOST_API_KEY, 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    const data = response.data;

    if (data.success === true && data.status === 'completed') {
      return { success: true, status: 'COMPLETED', data: data.data };
    }
    if (data.success === false || data.status === 'failed') {
      return { success: true, status: 'FAILED', message: data.message };
    }

    return { success: true, status: 'PROCESSING', message: 'Still pending' };

  } catch (error: any) {
    return { success: false, message: 'Check failed' };
  }
}
