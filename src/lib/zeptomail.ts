import { SendMailClient } from "zeptomail";

// --- CONFIGURATION ---
const SENDER_EMAIL = "noreply@agenthub.ng"; // Ensure this matches your ZeptoMail verified sender
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
    let url = process.env.ZEPTOMAIL_URL || "https://api.zeptomail.com/v1.1/email";
    
    if (url.endsWith('/send')) url = url.replace('/send', '');
    if (!url.startsWith('http')) url = `https://${url}`;

    let token = process.env.ZEPTOMAIL_TOKEN || "";
    if (!token.startsWith("Zoho-enczapikey")) token = `Zoho-enczapikey ${token}`;

    const client = new SendMailClient({ url, token });
    console.log(`🚀 Sending ZeptoMail to: ${to}`);

    const response = await client.sendMail({
      from: { address: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email_address: { address: to, name: name } }],
      subject: subject,
      htmlbody: html,
    });

    console.log("✅ Email Sent Successfully");
    return response;

  } catch (error: any) {
    console.error("❌ ZeptoMail Error:", JSON.stringify(error, null, 2));
    return null;
  }
}

// --- HTML TEMPLATES ---
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

export const emailTemplates = {
  // NEW Welcome Email
  welcomeEmail: (name: string) => wrapEmail(`
    <h2 style="color: #0f172a; margin-top: 0;">Welcome to AgentHub!</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for signing up with AgentHub. We are thrilled to have you on board.</p>
    <p>Your account is fully active. You can now access our suite of Identity (NIN, BVN), Corporate (CAC), and Utility services directly from your dashboard.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="btn">Login to Dashboard</a>
  `),

  // Removed adminNewUserAlert and registrationReceived

  accountApproved: (name: string) => wrapEmail(`
    <h2 style="color: #16a34a; margin-top: 0;">API Access Approved</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We are pleased to inform you that your request for Developer API Access has been <strong>Approved</strong>.</p>
    <p>You can now generate your API keys from the developer section of your dashboard.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="btn">Login to Dashboard</a>
  `),

  accountRejected: (name: string) => wrapEmail(`
    <h2 style="color: #dc2626; margin-top: 0;">Account Update</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for your interest in AgentHub. After reviewing your account, it has been suspended or rejected by an administrator.</p>
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
  `),
  
  emailVerificationOtp: (code: string) => wrapEmail(`
    <h2 style="color: #0f172a; margin-top: 0;">Verify your Email</h2>
    <p>Use the code below to verify your email address for AgentHub.</p>
    <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0; color: #0f172a;">
      ${code}
    </div>
    <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
  `),

  passwordResetOtp: (code: string) => wrapEmail(`
    <h2 style="color: #0f172a; margin-top: 0;">Reset Your Password</h2>
    <p>We received a request to reset the password for your AgentHub account.</p>
    <p>Use the code below to proceed:</p>
    <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0; color: #0f172a;">
      ${code}
    </div>
    <p>This code expires in 10 minutes.</p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
  `)
};
