const crypto = require('crypto');

/**
 * JanAudit Email Dispatcher & Template Engine
 * Supports standard SMTP (when configured) with development fallbacks.
 */

const getClientUrl = () => {
  return process.env.CLIENT_URL || 'http://localhost:5173';
};

const sendEmail = async ({ to, subject, html, text }) => {
  // If SMTP environment variables are present, we can use nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"JanAudit Security" <no-reply@janaudit.org>',
        to,
        subject,
        text,
        html,
      });

      console.log(`[EmailService] Dispatched email to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EmailService] SMTP error:', err.message);
    }
  }

  // Development Fallback: Log clearly formatted link for instant testing
  console.log('========================================================================');
  console.log(`[JanAudit Email Dispatcher]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text}`);
  console.log('========================================================================');
  return { success: true, simulated: true };
};

/**
 * Send Account Email Verification Link
 */
const sendVerificationEmail = async ({ email, handle, token }) => {
  const verificationLink = `${getClientUrl()}/verify-email?token=${token}`;
  const subject = 'Verify your email for JanAudit — India’s Public Accountability Platform';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FE; margin: 0; padding: 40px 20px; color: #0F172A; }
    .container { max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; border: 1px solid #E2E8F0; padding: 40px; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.06); }
    .logo { text-align: center; margin-bottom: 28px; }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); border-radius: 14px; color: #FFFFFF; font-size: 24px; }
    .brand-title { font-size: 24px; font-weight: 900; color: #0F172A; margin-top: 12px; }
    .brand-title span { color: #7C3AED; }
    .content-box { text-align: left; }
    h1 { font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 12px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 18px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #0F172A; color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: 700; border-radius: 14px; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15); }
    .btn:hover { background: #1E293B; }
    .link-alt { font-size: 12px; color: #64748B; word-break: break-all; margin-top: 20px; padding: 12px; background: #F8FAFC; border-radius: 10px; border: 1px solid #E2E8F0; }
    .footer { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 32px; border-top: 1px solid #F1F5F9; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-badge">🏛️</div>
      <div class="brand-title">Jan<span>Audit</span></div>
    </div>
    <div class="content-box">
      <h1>Verify your email address</h1>
      <p>Namaste <strong>@${handle}</strong>,</p>
      <p>Thank you for joining JanAudit, India's public accountability and democratic audit movement. Please verify your email address to activate your account and access your citizen console.</p>
      
      <div class="btn-container">
        <a href="${verificationLink}" class="btn" target="_blank">Verify Email Address →</a>
      </div>

      <p style="font-size: 13px; color: #64748B;">This verification link will remain valid for <strong>24 hours</strong>. If you did not create an account on JanAudit, please ignore this email.</p>
      
      <div class="link-alt">
        <strong>Direct link:</strong><br/>
        <a href="${verificationLink}" style="color: #7C3AED;">${verificationLink}</a>
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} JanAudit. Open Governance & Civic Accountability.
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Namaste @${handle},

Please verify your email address for JanAudit by visiting the following link:
${verificationLink}

This link is valid for 24 hours.

If you did not sign up for JanAudit, you can safely ignore this email.
`;

  return sendEmail({ to: email, subject, html, text });
};

/**
 * Send Password Reset Link
 */
const sendPasswordResetEmail = async ({ email, handle, token }) => {
  const resetLink = `${getClientUrl()}/reset-password?token=${token}`;
  const subject = 'Reset your password for JanAudit';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FE; margin: 0; padding: 40px 20px; color: #0F172A; }
    .container { max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; border: 1px solid #E2E8F0; padding: 40px; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.06); }
    .logo { text-align: center; margin-bottom: 28px; }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); border-radius: 14px; color: #FFFFFF; font-size: 24px; }
    .brand-title { font-size: 24px; font-weight: 900; color: #0F172A; margin-top: 12px; }
    .brand-title span { color: #7C3AED; }
    .content-box { text-align: left; }
    h1 { font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 12px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 18px; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #7C3AED; color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: 700; border-radius: 14px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25); }
    .btn:hover { background: #6D28D9; }
    .link-alt { font-size: 12px; color: #64748B; word-break: break-all; margin-top: 20px; padding: 12px; background: #F8FAFC; border-radius: 10px; border: 1px solid #E2E8F0; }
    .footer { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 32px; border-top: 1px solid #F1F5F9; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-badge">🏛️</div>
      <div class="brand-title">Jan<span>Audit</span></div>
    </div>
    <div class="content-box">
      <h1>Password Reset Request</h1>
      <p>Hello <strong>@${handle || 'Nagrik'}</strong>,</p>
      <p>We received a request to reset your password for your JanAudit account. Click the button below to choose a new password:</p>
      
      <div class="btn-container">
        <a href="${resetLink}" class="btn" target="_blank">Reset Password →</a>
      </div>

      <p style="font-size: 13px; color: #64748B;">This password reset link is valid for <strong>1 hour</strong>. If you did not request this, you can safely ignore this message; your password will remain unchanged.</p>
      
      <div class="link-alt">
        <strong>Direct link:</strong><br/>
        <a href="${resetLink}" style="color: #7C3AED;">${resetLink}</a>
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} JanAudit. Open Governance & Civic Accountability.
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hello @${handle || 'Nagrik'},

We received a request to reset your JanAudit account password.
Please visit the following link to choose a new password:
${resetLink}

This link is valid for 1 hour. If you did not request a password reset, no action is needed.
`;

  return sendEmail({ to: email, subject, html, text });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
