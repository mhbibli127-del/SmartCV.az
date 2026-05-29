/**
 * Production-safe transactional email service.
 * Never throws — failures are logged and swallowed.
 */
import nodemailer from "nodemailer";
type SendResult = { ok: boolean; method?: string; error?: string };

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT
    ? parseInt(process.env.SMTP_PORT, 10)
    : process.env.EMAIL_PORT
      ? parseInt(process.env.EMAIL_PORT, 10)
      : 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from =
    process.env.SMTP_FROM || process.env.EMAIL_FROM || "no-reply@smartcv.az";

  return { host, port, user, pass, from };
}

function isEmailConfigured(): boolean {
  const { host, user, pass } = getSmtpConfig();
  return Boolean(host && user && pass);
}

function wrapHtml(title: string, body: string) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; margin: 0 0 16px;">${title}</h2>
      ${body}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        SmartCV.AZ — Your AI-powered career platform
      </p>
    </div>
  `;
}

/** Core send — never throws. */
export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendResult> {
  const { host, port, user, pass, from } = getSmtpConfig();

  if (!isEmailConfigured()) {
    console.log("\n[Email] SMTP not configured — logging email to console:");
    console.log(`  To: ${params.to}`);
    console.log(`  Subject: ${params.subject}`);
    console.log(`  Body: ${params.text}\n`);
    return { ok: true, method: "console" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"SmartCV.AZ" <${from}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    console.log(`[Email] Sent "${params.subject}" to ${params.to}`);
    return { ok: true, method: "smtp" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    console.error("[Email] Send failed:", message);
    return { ok: false, error: message };
  }
}

/** Fire-and-forget wrapper — safe for API routes. */
export function sendEmailAsync(
  fn: () => Promise<SendResult>
): void {
  fn().catch((err) => console.error("[Email] Async send error:", err));
}

export async function sendStudentApprovedEmail(email: string, name?: string | null) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const subject = "Your student account has been approved";
  const text = `${greeting}\n\nYour student account has been approved. You now have access to the SmartCV student plan.\n\nLog in to start building your CV: https://smartcv.az/dashboard\n\n— SmartCV Team`;
  const html = wrapHtml(
    "Student Account Approved",
    `<p style="color:#475569;">${greeting}</p>
     <p style="color:#475569;">Your student account has been <strong>approved</strong>. You now have access to the SmartCV student plan with verified student benefits.</p>
     <p style="margin-top:24px;"><a href="https://smartcv.az/dashboard" style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a></p>`
  );
  return sendTransactionalEmail({ to: email, subject, text, html });
}

