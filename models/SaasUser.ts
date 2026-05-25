import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { SubscriptionStatus, UserPlan } from "@/lib/user-plans";

export interface ISaasUser extends Document {
  email: string;
  name: string;
  plan: UserPlan;
  cvUsed: number;
  cvLimit: number;
  status: SubscriptionStatus;
  paddleSubscriptionId?: string;
  paddleCustomerId?: string;
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
    plan: {
      type: String,
      enum: ["free", "basic", "pro"],
      default: "free",
    },
    cvUsed: { type: Number, default: 0, min: 0 },
    cvLimit: { type: Number, default: 3, min: 0 },
    status: {
      type: String,
      enum: ["active", "past_due"],
      default: "active",
    },
    paddleSubscriptionId: { type: String, sparse: true, index: true },
    paddleCustomerId: { type: String },
  },
  { timestamps: true, collection: "saas_users" }
);

const SaasUser: Model<ISaasUser> =
  mongoose.models.SaasUser ??
  mongoose.model<ISaasUser>("SaasUser", SaasUserSchema);

export default SaasUser;
