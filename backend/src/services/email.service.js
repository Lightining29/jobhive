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

const sendMail = async ({ to, subject, text, html }) => {
  const t = getTransporter();
  if (env.smtp.dev || !t) {
    logger.info(`[mail][dev] To: ${to} | Subject: ${subject}`);
    logger.debug(`[mail][dev] Body: ${text || html}`);
    return { dev: true, to, subject };
  }
  await t.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html,
  });
  logger.info(`[mail] Sent to ${to} (${subject})`);
  return { sent: true, to, subject };
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

module.exports = { sendMail, buildEmailHtml };
