const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

let transporter = null;

const getTransporter = () => {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  return transporter;
};

const sendBrevoMail = async ({ to, toName, subject, text, html }) => {
  const apiKey = env.brevo?.apiKey ? env.brevo.apiKey.trim() : '';
  if (!apiKey) return null;

  const url = 'https://api.brevo.com/v3/smtp/email';
  const senderEmail = env.brevo.senderEmail?.trim() || 'no-reply@jobhive.app';
  const senderName = env.brevo.senderName?.trim() || 'JobHive';

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: to.trim(), name: toName || to.split('@')[0] }],
    subject,
    htmlContent: html || `<p>${text || ''}</p>`,
    textContent: text || '',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedMsg = errorText;
    try {
      const parsed = JSON.parse(errorText);
      parsedMsg = parsed.message || errorText;
    } catch (_) {}
    logger.error(`[mail][brevo] API error (${response.status}): ${parsedMsg}`);
    throw new Error(`Brevo error: ${parsedMsg}`);
  }

  const data = await response.json();
  logger.info(`[mail][brevo] Email successfully delivered to ${to} (${subject}) - messageId: ${data.messageId || 'ok'}`);
  return { sent: true, provider: 'brevo', messageId: data.messageId, to, subject };
};

const sendMail = async ({ to, toName, subject, text, html }) => {
  // 1. Try Brevo REST API first if API key is provided
  if (env.brevo?.apiKey && env.brevo.apiKey.trim().length > 0) {
    try {
      const result = await sendBrevoMail({ to, toName, subject, text, html });
      if (result) return result;
    } catch (err) {
      logger.error(`[mail][brevo] Failed: ${err.message}`);
      throw err;
    }
  }

  // 2. Try SMTP if configured and not in dev mode
  const t = getTransporter();
  if (t && !env.smtp.dev) {
    try {
      await t.sendMail({
        from: env.smtp.from,
        to,
        subject,
        text,
        html,
      });
      logger.info(`[mail][smtp] Sent to ${to} (${subject})`);
      return { sent: true, provider: 'smtp', to, subject };
    } catch (err) {
      logger.error(`[mail][smtp] Failed: ${err.message}`);
      throw new Error(`SMTP Error: ${err.message}`);
    }
  }

  // 3. Fallback dev logger (local development mode)
  if (env.smtp.dev || process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    logger.info(`[mail][dev] Verification email sent to: ${to} | Subject: ${subject}`);
    logger.debug(`[mail][dev] Body: ${text || html}`);
    return { dev: true, sent: true, to, subject };
  }

  // 4. Production error if no email transport configured
  throw new Error('Email service is not configured. Please set BREVO_API_KEY in .env');
};

const buildEmailHtml = (heading, content, ctaText, ctaUrl) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#FACC15;padding:20px 28px">
      <span style="font-size:20px;font-weight:800;color:#111827">JobHive</span>
    </div>
    <div style="padding:28px">
      <h2 style="color:#111827;margin:0 0 12px">${heading}</h2>
      <div style="color:#374151;font-size:15px;line-height:1.6">${content}</div>
      ${ctaText && ctaUrl ? `<div style="margin-top:24px">
        <a href="${ctaUrl}" style="display:inline-block;background:#FACC15;color:#111827;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none">${ctaText}</a>
      </div>` : ''}
      <p style="color:#9ca3af;font-size:12px;margin-top:28px">If the button does not work, copy and paste this link into your browser:<br/><a href="${ctaUrl}">${ctaUrl}</a></p>
    </div>
  </div>
`;

const buildOtpEmailHtml = ({ name, otp, expiryMinutes = 10 }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JobHive Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 36px; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-flex; align-items: center; gap: 8px;">
                      <span style="display: inline-block; width: 14px; height: 14px; background-color: #FACC15; border-radius: 4px; vertical-align: middle; margin-right: 8px;"></span>
                      <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; vertical-align: middle;">JobHive</span>
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background: rgba(250, 204, 21, 0.15); color: #FACC15; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(250, 204, 21, 0.3);">
                      Security Verification
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; background-color: #ffffff;">
              <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3;">
                Verify your email address
              </h1>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Hello <strong>${name || 'there'}</strong>,<br/>
                Thank you for joining <strong>JobHive</strong>. To complete your registration and secure your account, please enter the one-time verification code below:
              </p>

              <!-- OTP Code Display Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px 20px;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px;">
                      Your One-Time Passcode (OTP)
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #0f172a; padding-left: 10px;">
                      ${otp}
                    </div>
                    <div style="font-size: 13px; color: #e11d48; font-weight: 600; margin-top: 10px;">
                      ⏰ Expires in ${expiryMinutes} minutes
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 12px 16px; margin: 24px 0 0 0;">
                <p style="color: #1e40af; font-size: 13px; line-height: 1.5; margin: 0;">
                  <strong>Security Note:</strong> Never share this OTP with anyone. JobHive staff will never ask for your verification code or password.
                </p>
              </div>

              <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
                If you did not attempt to sign up on JobHive, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 36px;">
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #fafafa; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0 0 6px 0;">
                © ${new Date().getFullYear()} JobHive. All rights reserved.
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                Empowering candidates & recruiters worldwide.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = { sendMail, buildEmailHtml, buildOtpEmailHtml };

