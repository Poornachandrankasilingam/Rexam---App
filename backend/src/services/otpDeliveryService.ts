import nodemailer from 'nodemailer';

/**
 * Service to deliver secure OTPs to user Email or Phone
 * Configurable via environment variables (SMTP, Resend, Twilio, SMS Gateway)
 */

export interface OtpDeliveryOptions {
  target: string; // Email address or E.164 phone number
  type: 'EMAIL' | 'PHONE';
  otpCode: string;
  userName?: string;
}

/**
 * Send OTP via Email (Nodemailer SMTP or Resend API)
 */
export async function sendEmailOtp({ target, otpCode, userName }: OtpDeliveryOptions): Promise<boolean> {
  const name = userName || 'Candidate';

  const subject = 'Rexam – Your Verification OTP';
  const textMessage = `Hello ${name},\n\nYour Rexam verification OTP is:\n\n${otpCode}\n\nThis OTP is valid for 5 minutes.\n\nDo not share this OTP with anyone.\n\nRegards,\nRexam Team`;

  const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background-color: #0f172a; border-radius: 24px; color: #f8fafc; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 800; color: #38bdf8; margin: 0; tracking-tight: -0.05em;">REXAM<span style="color: #60a5fa;">.AI</span></h2>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">AI-Powered Government Exam Platform</p>
      </div>

      <div style="background-color: #1e293b; padding: 24px; border-radius: 16px; border: 1px solid #334155; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #cbd5e1; margin-top: 0;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">Your Rexam verification OTP is:</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; background: #0f172a; padding: 12px 28px; border-radius: 12px; border: 1px solid #0284c7; display: inline-block;">
            ${otpCode}
          </span>
        </div>

        <p style="font-size: 12px; color: #f59e0b; margin-bottom: 4px; text-align: center;">⏱️ This OTP is valid for <strong>5 minutes</strong>.</p>
        <p style="font-size: 11px; color: #64748b; margin: 0; text-align: center;">Do not share this OTP with anyone.</p>
      </div>

      <div style="text-align: center; border-top: 1px solid #1e293b; pt: 16px;">
        <p style="font-size: 11px; color: #64748b; margin: 0;">Regards,<br><strong>Rexam Security Team</strong></p>
      </div>
    </div>
  `;

  // 1. Try Resend API if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Rexam Auth <onboarding@resend.dev>',
          to: [target],
          subject,
          html: htmlMessage,
          text: textMessage
        })
      });
      if (res.ok) {
        console.log(`📬 [RESEND API] Live OTP email dispatched to ${target}`);
        return true;
      }
    } catch (err: any) {
      console.warn(`⚠️ Resend API delivery attempt error:`, err.message);
    }
  }

  // 2. Try SMTP Nodemailer if SMTP configuration is set
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `Rexam Security <${user}>`,
        to: target,
        subject,
        text: textMessage,
        html: htmlMessage
      });

      console.log(`📬 [SMTP EMAIL] Live OTP email delivered to ${target}`);
      return true;
    } catch (err: any) {
      console.warn(`⚠️ SMTP email delivery attempt error:`, err.message);
    }
  }

  // Server-side operational log for development environment when credentials are pending configuration
  console.log(`📬 [EMAIL SERVICE NOTICE] OTP generated for ${target}. (Configure SMTP_USER/PASS or RESEND_API_KEY in .env for live inbox delivery).`);
  return true;
}

/**
 * Send OTP via SMS (Twilio or SMS Gateway)
 */
export async function sendSmsOtp({ target, otpCode, userName }: OtpDeliveryOptions): Promise<boolean> {
  const name = userName || 'Candidate';
  const messageBody = `Hello ${name}, Your Rexam verification OTP is: ${otpCode}. Valid for 5 minutes. Do not share with anyone. - Rexam Team`;

  // 1. Try Twilio SMS if credentials are configured
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && fromNumber) {
    try {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const params = new URLSearchParams();
      params.append('To', target);
      params.append('From', fromNumber);
      params.append('Body', messageBody);

      const res = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (res.ok) {
        console.log(`📱 [TWILIO SMS] Live OTP SMS dispatched to ${target}`);
        return true;
      }
    } catch (err: any) {
      console.warn(`⚠️ Twilio SMS delivery error:`, err.message);
    }
  }

  // Server-side operational log for development environment
  console.log(`📱 [SMS SERVICE NOTICE] OTP generated for phone ${target}. (Configure TWILIO_ACCOUNT_SID/AUTH_TOKEN in .env for live SMS delivery).`);
  return true;
}

/**
 * Dispatch OTP based on type (EMAIL or PHONE)
 */
export async function deliverOtp(options: OtpDeliveryOptions): Promise<boolean> {
  if (options.type === 'PHONE') {
    return sendSmsOtp(options);
  }
  return sendEmailOtp(options);
}
