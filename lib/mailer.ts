import nodemailer from "nodemailer";

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } =
  process.env;

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
  // Avoid crashing module import in environments where mail isn't configured.
  // Routes using this should still handle runtime errors.
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT ? Number(EMAIL_PORT) : undefined,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export default transporter;
export { EMAIL_FROM };

