import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer Transport
 * Supports custom SMTP settings via .env:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const user = process.env.SMTP_USER;
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    return null; // SMTP not fully configured
  }

  // Optimize for Gmail service
  if (host.includes('gmail') || (user && user.includes('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
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
  });
};

const getFromAddress = () => {
  return process.env.SMTP_FROM || `"AmmarDev Luxury CRM" <${process.env.SMTP_USER || 'no-reply@ammardev.com'}>`;
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

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: `${code} is your AmmarDev CRM Verification Code for ${brandName}`,
      html,
    });
    console.log('[Email Service] Email sent successfully:', info.messageId);
    return { sent: true, simulated: false, messageId: info.messageId };
  } catch (err) {
    console.error('[Email Service Error]: Failed to send verification email via SMTP:', err.message);
    return { sent: false, error: err.message, simulated: true, code };
  }
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

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: `${code} is your AmmarDev CRM Password Reset Code`,
      html,
    });
    console.log('[Email Service] Reset email sent successfully:', info.messageId);
    return { sent: true, simulated: false, messageId: info.messageId };
  } catch (err) {
    console.error('[Email Service Error]: Failed to send reset email via SMTP:', err.message);
    return { sent: false, error: err.message, simulated: true, code };
  }
};
