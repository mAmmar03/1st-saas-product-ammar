import nodemailer from 'nodemailer';

const defaultSmtpUser = Buffer.from('YW1tYXJkZXYwM0BnbWFpbC5jb20=', 'base64').toString('utf8'); // ammardev03@gmail.com
const defaultSmtpPass = Buffer.from('ZHRuZ3RiYXpwYW95enZ1dQ==', 'base64').toString('utf8'); // dtngtbazpaoyzvuu

/**
 * Configure Nodemailer Transport with fast connection timeouts (prevents hanging on blocked ports)
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const user = process.env.SMTP_USER || defaultSmtpUser;
  const pass = (process.env.SMTP_PASS || defaultSmtpPass).replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  // Optimize for Gmail service with fast timeouts
  if (host.includes('gmail') || (user && user.includes('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 5000,
    });
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 4000,
    greetingTimeout: 4000,
    socketTimeout: 5000,
  });
};

const getFromAddress = () => {
  const sender = process.env.SMTP_USER || defaultSmtpUser;
  return process.env.SMTP_FROM || `"AmmarDev Luxury CRM" <${sender}>`;
};

/**
 * Universal Email Dispatcher
 * Priority:
 * 1. Brevo HTTP REST API (Port 443 - 100% works on Render without SMTP restrictions)
 * 2. Resend HTTP REST API (Port 443)
 * 3. Nodemailer SMTP (Fast 4s timeout)
 */
const dispatchHtmlEmail = async ({ to, subject, html }) => {
  const senderEmail = process.env.SMTP_USER || defaultSmtpUser;

  // 1. Brevo HTTP API (Port 443 HTTPS - Free 300 emails/day, no credit card required)
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'AmmarDev Luxury CRM', email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`[Email Service] ✅ Sent via Brevo HTTP API to ${to}:`, data.messageId || 'Delivered');
        return { sent: true, provider: 'brevo', messageId: data.messageId };
      }
      console.warn('[Email Service] Brevo API responded with error:', data);
    } catch (err) {
      console.error('[Email Service] Brevo fetch error:', err.message);
    }
  }

  // 2. Resend HTTP API (Port 443 HTTPS)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'AmmarDev CRM <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`[Email Service] ✅ Sent via Resend HTTP API to ${to}:`, data.id);
        return { sent: true, provider: 'resend', messageId: data.id };
      }
      console.warn('[Email Service] Resend API responded with error:', data);
    } catch (err) {
      console.error('[Email Service] Resend fetch error:', err.message);
    }
  }

  // 3. Fallback: Nodemailer SMTP
  const transporter = createTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: getFromAddress(),
        to,
        subject,
        html,
      });
      console.log(`[Email Service] ✅ Sent via SMTP to ${to}:`, info.messageId);
      return { sent: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.warn(`[Email Service Notice]: SMTP send to ${to} failed (likely cloud port 465/587 blocked):`, err.message);
      return { sent: false, error: err.message, simulated: true };
    }
  }

  return { sent: false, simulated: true };
};

/**
 * Send 6-Digit Email Verification Code
 */
export const sendVerificationEmail = async ({ email, code, brandName = 'Brand Workspace' }) => {
  console.log(`\n==================================================`);
  console.log(`[Email Service] 📧 EMAIL VERIFICATION CODE for ${email}: [ ${code} ]`);
  console.log(`[Workspace]: ${brandName}`);
  console.log(`==================================================\n`);

  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Service Notice]: SMTP is not configured in .env. Code ${code} logged above.`);
    return { sent: false, simulated: true, code };
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">AmmarDev Influencer CRM</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Enterprise PR & Influencer Management Platform</p>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #edf2f7;">
        <p style="margin: 0 0 12px; color: #334155; font-size: 14px; font-weight: 500;">
          Welcome to <strong>${brandName}</strong>! Please verify your email address to activate your brand workspace.
        </p>
        <div style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 28px; font-weight: 800; letter-spacing: 6px; font-family: monospace;">
          ${code}
        </div>
        <p style="margin: 16px 0 0; color: #94a3b8; font-size: 12px;">This code will expire in 15 minutes.</p>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
        If you did not request this workspace account, please ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
      <div style="text-align: center; color: #94a3b8; font-size: 11px;">
        © 2026 AmmarDev CRM Architecture. All rights reserved.
      </div>
    </div>
  `;

  return await dispatchHtmlEmail({
    to: email,
    subject: `${code} is your AmmarDev CRM Verification Code for ${brandName}`,
    html,
  });
};

/**
 * Send 6-Digit Password Reset Code
 */
export const sendPasswordResetEmail = async ({ email, code, name = 'User' }) => {
  console.log(`\n==================================================`);
  console.log(`[Email Service] 🔑 PASSWORD RESET CODE for ${email}: [ ${code} ]`);
  console.log(`[User]: ${name}`);
  console.log(`==================================================\n`);

  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Service Notice]: SMTP is not configured in .env. Code ${code} logged above.`);
    return { sent: false, simulated: true, code };
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">AmmarDev Influencer CRM</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Security & Password Reset Request</p>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #edf2f7;">
        <p style="margin: 0 0 12px; color: #334155; font-size: 14px; font-weight: 500;">
          Hello <strong>${name}</strong>, we received a request to reset your workspace password.
        </p>
        <div style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 28px; font-weight: 800; letter-spacing: 6px; font-family: monospace;">
          ${code}
        </div>
        <p style="margin: 16px 0 0; color: #94a3b8; font-size: 12px;">This reset code will expire in 15 minutes.</p>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px;" />
      <div style="text-align: center; color: #94a3b8; font-size: 11px;">
        © 2026 AmmarDev CRM Architecture. All rights reserved.
      </div>
    </div>
  `;

  return await dispatchHtmlEmail({
    to: email,
    subject: `${code} is your AmmarDev CRM Password Reset Code`,
    html,
  });
};
