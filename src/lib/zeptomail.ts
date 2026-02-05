import axios from 'axios';

// --- CONFIGURATION ---
// IMPORTANT: Replace this with the verified email from your ZeptoMail "Email Agents" settings.
// If this does not match exactly, you will get a 403 Forbidden error.
const SENDER_EMAIL = "no-reply@agenthub.ng"; 
const SENDER_NAME = "AgentHub Support";

interface EmailPayload {
  to: string;
  name: string;
  subject: string;
  html: string;
}

// --- SEND FUNCTION ---
export async function sendEmail({ to, name, subject, html }: EmailPayload) {
  try {
    const response = await axios.post(
      `https://${process.env.ZEPTOMAIL_URL}`,
      {
        from: { address: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email_address: { address: to, name: name } }],
        subject: subject,
        htmlbody: html,
      },
      {
        headers: {
          'Authorization': `Zoho-enczapikey ${process.env.ZEPTOMAIL_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    // --- IMPROVED ERROR LOGGING ---
    if (axios.isAxiosError(error)) {
      console.error("❌ ZeptoMail API Error:");
      console.error("Status:", error.response?.status);
      console.error("Reason:", JSON.stringify(error.response?.data, null, 2)); // <--- This reveals the real message
    } else {
      console.error("❌ ZeptoMail Unexpected Error:", error);
    }
    return null;
  }
}

// --- HTML TEMPLATES ---

// 1. HEADER & FOOTER WRAPPER (Branding)
const wrapEmail = (content: string) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Arial', sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background: #0f172a; padding: 30px; text-align: center; }
  .logo { color: #ffffff; font-size: 24px; font-weight: bold; text-decoration: none; letter-spacing: 1px; }
  .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
  .btn { display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
  .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">AgentHub</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} AgentHub. All rights reserved.<br>
      Secure Identity & Corporate Services Platform.
    </div>
  </div>
</body>
</html>
`;

// 2. TEMPLATE: User Registration Received
export const emailTemplates = {
  registrationReceived: (name: string) => wrapEmail(`
    <h2 style="color: #0f172a; margin-top: 0;">Registration Received</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for signing up with AgentHub. We have received your registration details.</p>
    <p>Your account is currently <strong>Under Review</strong> by our compliance team. This process typically takes 1-24 hours. You will receive an email immediately once your account status is updated.</p>
    <p>Thank you for your patience.</p>
  `),

  adminNewUserAlert: (name: string, email: string) => wrapEmail(`
    <h2 style="color: #0f172a; margin-top: 0;">New User Registration</h2>
    <p>Admin,</p>
    <p>A new user has just registered and requires verification.</p>
    <ul style="background: #f8fafc; padding: 20px; border-radius: 8px; list-style: none;">
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
    </ul>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/users" class="btn">Review User</a>
  `),

  accountApproved: (name: string) => wrapEmail(`
    <h2 style="color: #16a34a; margin-top: 0;">Congratulations! Account Approved</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We are pleased to inform you that your AgentHub account has been verified and <strong>Approved</strong>.</p>
    <p>You now have full access to our suite of Identity (NIN, BVN), Corporate (CAC), and Utility services.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="btn">Login to Dashboard</a>
  `),

  accountRejected: (name: string) => wrapEmail(`
    <h2 style="color: #dc2626; margin-top: 0;">Registration Update</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for your interest in AgentHub. After reviewing your application, we regret to inform you that we cannot approve your account at this time.</p>
    <p>If you believe this is an error, please contact our support team for further clarification.</p>
  `),
  
  serviceStatusUpdate: (name: string, serviceType: string, status: 'COMPLETED' | 'FAILED', note?: string) => wrapEmail(`
    <h2 style="color: #0f172a; margin-top: 0;">Request Update: ${serviceType}</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>The status of your <strong>${serviceType}</strong> request has been updated.</p>
    
    <div style="margin: 20px 0; padding: 15px; border-left: 4px solid ${status === 'COMPLETED' ? '#16a34a' : '#dc2626'}; background: #f8fafc;">
      <strong>New Status:</strong> <span style="color: ${status === 'COMPLETED' ? '#16a34a' : '#dc2626'}; font-weight: bold;">${status}</span><br>
      ${note ? `<strong>Admin Note:</strong> ${note}` : ''}
    </div>

    <p>Please login to your dashboard to view the full details or download any generated documents.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">View Request</a>
  `)
};
