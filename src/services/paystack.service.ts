import axios from 'axios';

interface PaystackBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  active: boolean;
  is_deleted: boolean;
}

export async function fetchPaystackBanks(): Promise<{ success: boolean; data?: { name: string; code: string }[]; error?: string }> {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.warn('PAYSTACK_SECRET_KEY is not defined in environment variables.');
      return { success: false, error: 'Paystack Secret Key is missing.' };
    }

    const response = await axios.get('https://api.paystack.co/bank?country=nigeria&perPage=100', {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      timeout: 10000,
    });

    if (response.data && response.data.status && Array.isArray(response.data.data)) {
      const banks = response.data.data
        .filter((b: PaystackBank) => b.active && !b.is_deleted)
        .map((b: PaystackBank) => ({
          name: b.name,
          code: b.code,
        }))
        .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));

      return { success: true, data: banks };
    }

    return { success: false, error: 'Invalid response from Paystack bank directory.' };
  } catch (error: any) {
    console.error('Error fetching banks from Paystack:', error?.response?.data || error?.message);
    return {
      success: false,
      error: error?.response?.data?.message || 'Failed to fetch bank list. Please try again later.',
    };
  }
}

export async function resolvePaystackAccount(
  accountNumber: string,
  bankCode: string
): Promise<{ success: boolean; accountName?: string; accountNumber?: string; error?: string }> {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return { success: false, error: 'Paystack Secret Key is missing.' };
    }

    if (!accountNumber || accountNumber.length !== 10) {
      return { success: false, error: 'Account number must be exactly 10 digits.' };
    }

    if (!bankCode) {
      return { success: false, error: 'Please select a bank.' };
    }

    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.status && response.data.data) {
      return {
        success: true,
        accountName: response.data.data.account_name,
        accountNumber: response.data.data.account_number,
      };
    }

    return {
      success: false,
      error: response.data?.message || 'Could not resolve account details.',
    };
  } catch (error: any) {
    console.error('Error resolving bank account with Paystack:', error?.response?.data || error?.message);
    return {
      success: false,
      error: error?.response?.data?.message || 'Could not verify account details. Please check the account number and bank.',
    };
  }
}
