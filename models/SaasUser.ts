import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISaasUser extends Document {
  email: string;
  name: string;
  plan: string;
  cvUsed: number;
  cvLimit: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaasUserSchema = new Schema<ISaasUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, default: "User" },
    plan: { type: String, default: "free" },
    cvUsed: { type: Number, default: 0, min: 0 },
    cvLimit: { type: Number, default: 999_999_999, min: 0 },
    status: { type: String, default: "active" },
  },
  { timestamps: true, collection: "saas_users" }
);

const SaasUser: Model<ISaasUser> =
  mongoose.models.SaasUser ??
  mongoose.model<ISaasUser>("SaasUser", SaasUserSchema);

export default SaasUser;
