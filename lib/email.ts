import nodemailer from "nodemailer";

export async function sendOtpEmail(email: string, code: string) {
  // Support both SMTP_* and EMAIL_* env var names
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || "no-reply@smartcv.az";

  // Check if we have SMTP details configured
  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for others (e.g., 587)
        auth: { user, pass },
      });
      // Verify connection configuration
      try {
        await transporter.verify();
        console.log("[Email] SMTP connection verified.");
      } catch (verifyErr) {
        console.error("[Email] SMTP verification failed:", verifyErr);
      }

      const info = await transporter.sendMail({
        from: `"SmartCV.AZ" <${from}>`,
        to: email,
        subject: "Daxil olmaq üçün təsdiq kodu - SmartCV.AZ",
        text: `Salam!\n\nSmartCV.AZ hesabınıza daxil olmaq üçün OTP kodunuz: ${code}\n\nBu kod 5 dəqiqə ərzində etibarlıdır.\n\nHörmətlə,\nSmartCV Komandası`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; text-align: center;">SmartCV.AZ Təsdiq Kodu</h2>
            <p style="color: #475569; font-size: 16px;">Salam!</p>
            <p style="color: #475569; font-size: 16px;">Hesabınıza daxil olmaq üçün birdəfəlik təsdiq kodunuz (OTP) aşağıdadır:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000000; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">${code}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">Bu kod <strong>5 dəqiqə</strong> ərzində etibarlıdır. Əgər bu kodu siz istəməmisinizsə, zəhmət olmasa bu məktubu diqqətə almayın.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">SmartCV.AZ - Karyeranızda Yeni Addım</p>
          </div>
        `,
      });

      console.log(`[Email] OTP email successfully sent to ${email}`, { messageId: info.messageId });

      // If using test account, return preview URL
      const preview = (nodemailer as any).getTestMessageUrl ? (nodemailer as any).getTestMessageUrl(info) : null;
      if (preview) console.log(`[Email] Preview URL: ${preview}`);

      return { success: true, method: "smtp", info, preview };
    } catch (err) {
      console.error("[Email] Failed to send email via SMTP, falling back to console log:", err);
    }
  }

  // Fallback: print to console in development
  console.log("\n" + "=".repeat(60));
  console.log("               SmartCV.AZ OTP TƏSDİQ KODU");
  console.log("=".repeat(60));
  console.log(` E-mail:       ${email}`);
  console.log(` OTP Kod:      ${code}`);
  console.log(` Etibarlılıq:  5 Dəqiqə`);
  console.log("=".repeat(60));
  console.log(" QEYD: SMTP sazlanmadığı üçün bu kod terminala yazdırıldı.");
  console.log("=".repeat(60) + "\n");

  return { success: true, method: "console" };
}
