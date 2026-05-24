import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  code: string;
  expiresAt: Date;
}

const OtpSchema: Schema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 300 } }, // Expires in 5 minutes (300 seconds)
  },
  { timestamps: true }
);

// Prevent mongoose model compilation errors during Next.js Hot Module Replacement (HMR)
export default mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
