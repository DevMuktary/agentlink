import axios from 'axios';

const API_KEY = process.env.PAYMENTPOINT_API_KEY; 
const API_SECRET = process.env.PAYMENTPOINT_API_SECRET; 
const BUSINESS_ID = process.env.PAYMENTPOINT_BUSINESS_ID;
const BASE_URL = 'https://api.paymentpoint.co/api/v1';

export async function createVirtualAccount(user: { email: string, name: string, phone: string }) {
    if (!API_KEY || !API_SECRET || !BUSINESS_ID) {
        return { success: false, error: 'PaymentPoint Config Missing' };
    }

    try {
        const payload = {
            email: user.email,
            name: user.name,
            phoneNumber: user.phone,
            bankCode: ['20946', '20897'], // Asking for both Palmpay (20946) & Opay (20897)
            businessId: BUSINESS_ID
        };

        const response = await axios.post(`${BASE_URL}/createVirtualAccount`, payload, {
            headers: {
                'Authorization': `Bearer ${API_SECRET}`,
                'api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;

        if (data.status === 'success' && data.bankAccounts?.length > 0) {
            
            // --- PRIORITY LOGIC ---
            // 1. Try to find PalmPay (20946)
            let selectedAccount = data.bankAccounts.find((acc: any) => acc.bankCode === '20946');
            
            // 2. If no PalmPay, try OPay (20897)
            if (!selectedAccount) {
                selectedAccount = data.bankAccounts.find((acc: any) => acc.bankCode === '20897');
            }

            // 3. Fallback to the first one available
            if (!selectedAccount) {
                selectedAccount = data.bankAccounts[0];
            }

            return {
                success: true,
                data: {
                    accountName: selectedAccount.accountName,
                    accountNumber: selectedAccount.accountNumber,
                    bankName: selectedAccount.bankName,
                    customerId: data.customer?.customer_id
                }
            };
        }

        return { success: false, error: data.message || 'Failed to generate account' };

    } catch (error: any) {
        console.error("PaymentPoint Error:", error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || 'Connection Error' };
    }
}
