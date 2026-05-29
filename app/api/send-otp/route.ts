"use server";

import nodemailer from "nodemailer";
import { parseJsonBody } from "@/lib/safe-route";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, otp } = await parseJsonBody(request);
    if (!email || !otp) {
      return NextResponse.json({ error: "Missing email or otp" }, { status: 400 });
    }

    // Determine transporter – use real SMTP if env vars are set, otherwise fallback to Nodemailer test account
    let transporter;
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
    } else {
      // Create a test account (Ethereal) – useful for local development
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || "no-reply@smartcv.az",
      to: email,
      subject: "SmartCV OTP Verification",
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your OTP code is: <b>${otp}</b></p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    // If using a test account, log preview URL for dev convenience
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview URL:", previewUrl);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
