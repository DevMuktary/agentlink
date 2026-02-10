import axios from 'axios';

// --- CONFIGURATION ---
const ACCESS_TOKEN = process.env.RAUDAH_ACCESS_TOKEN; 
const ENDPOINT = 'https://raudah.com.ng/api/bvn/bvn';

export interface BvnResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export async function verifyBvn(bvn: string, reference: string = ''): Promise<BvnResult> {
  if (!ACCESS_TOKEN) {
    console.error("CRITICAL: RAUDAH_ACCESS_TOKEN is missing in environment variables.");
    return { success: false, error: 'Service Configuration Error' };
  }

  // Generate a random reference if none is provided (just in case)
  const txRef = reference || `BVN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    const payload = {
      value: bvn,
      ref: txRef
    };

    console.log(`Submitting BVN to Raudah: ${bvn} | Ref: ${txRef}`);

    const response = await axios.post(ENDPOINT, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ACCESS_TOKEN // Format: "APIKEY:PASSWORD"
      },
      timeout: 45000 // 45s timeout
    });

    const apiRes = response.data;
    console.log("Raudah Response:", JSON.stringify(apiRes, null, 2));

    // The user requested: "whatever their response is what we send to our user api straight"
    // We treat HTTP 200 as success and pass the entire raw body in `data`.
    return {
      success: true,
      message: 'Request Processed',
      data: apiRes // <--- RAW RESPONSE PASSED HERE
    };

  } catch (error: any) {
    console.error("Raudah Verification Error:", error.response?.data || error.message);

    // If the provider returns a structured error (e.g. 404 Not Found), pass that too if possible
    if (error.response?.data) {
        return { 
            success: false, 
            error: error.response.data.message || 'Provider Rejected Request',
            data: error.response.data // Pass error data too just in case
        };
    }

    return { success: false, error: 'Connection to Provider Failed' };
  }
}
