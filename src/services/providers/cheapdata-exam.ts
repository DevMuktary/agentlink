import axios from 'axios';

const API_KEY = process.env.CHEAPDATA_API_KEY;
const BASE_URL = 'https://cheapdatasales.com/autobiz_vending_index.php';

export interface ExamPinResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// Map Internal Enums to Product Codes
export const EXAM_PRODUCT_CODES: Record<string, string> = {
  'EXAM_PIN_WAEC': 'waec_pin',
  'EXAM_PIN_NECO': 'neco_pin',
  'EXAM_PIN_NABTEB': 'nabteb_pin',
  'EXAM_PIN_JAMB_UTME': 'utme_pin',
  'EXAM_PIN_JAMB_DE': 'direct_entry_de'
};

export async function purchaseExamPin(
  productCode: string, 
  quantity: number,
  phoneNumber: string, 
  reference: string
): Promise<ExamPinResult> {
  
  if (!API_KEY) {
    console.error("CRITICAL: CHEAPDATA_API_KEY is missing.");
    return { success: false, error: 'Service Configuration Error' };
  }

  try {
    const payload = {
      product_code: productCode,
      phone_number: phoneNumber,
      action: 'vend',
      quantity: quantity,
      user_reference: reference
    };

    const response = await axios.post(BASE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Bearer': API_KEY
      },
      timeout: 60000
    });

    const apiRes = response.data;

    // Success Check
    if (apiRes.status === true || apiRes.text_status === 'COMPLETED') {
      
      // PARSE THE "true_response" STRING
      // The provider returns: "[{\"pin\":\"...\"}]" -> We need: [{ pin: "..." }]
      let pins = [];
      try {
        if (typeof apiRes.data.true_response === 'string') {
            pins = JSON.parse(apiRes.data.true_response);
        } else {
            pins = apiRes.data.true_response; // Fallback if they fix their API
        }
      } catch (e) {
        console.error("Failed to parse PINs:", e);
        pins = [{ raw: apiRes.data.true_response }]; // Return raw if parse fails
      }

      return {
        success: true,
        message: 'Exam Pins Generated Successfully',
        data: {
          product_code: productCode,
          quantity: quantity,
          amount_charged: apiRes.data.amount_charged,
          pins: pins, // CLEAN ARRAY
          provider_ref: apiRes.data.recharge_id,
          balance_after: apiRes.data.after_balance
        }
      };
    }

    return {
      success: false,
      error: apiRes.server_message || 'Transaction Failed'
    };

  } catch (error: any) {
    if (error.response) {
       console.error("Exam Pin Error:", error.response.data);
       return { success: false, error: error.response.data.server_message || 'Provider Error' };
    }
    console.error("Exam Pin Connection Error:", error.message);
    return { success: false, error: 'Connection Failed' };
  }
}
