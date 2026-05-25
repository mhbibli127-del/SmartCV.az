import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { CVContent } from "@/types/cv-document";

export interface ICv extends Document {
  userId: string;
  userEmail: string;
  title: string;
  templateId: number;
  content: CVContent;
  status: "draft" | "completed";
  atsScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CvSchema = new Schema<ICv>(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, index: true },
    title: { type: String, required: true, default: "Untitled CV" },
    templateId: { type: Number, default: 1 },
    content: { type: Schema.Types.Mixed, required: true, default: {} },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
    atsScore: { type: Number },
  },
  { timestamps: true, collection: "cvs" }
);

CvSchema.index({ userId: 1, updatedAt: -1 });

const Cv: Model<ICv> = mongoose.models.Cv ?? mongoose.model<ICv>("Cv", CvSchema);

export default Cv;
