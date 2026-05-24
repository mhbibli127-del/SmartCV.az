import mongoose, { type InferSchemaType, Schema } from "mongoose";

const EventSchema = new Schema(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: false,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

export type EventDoc = InferSchemaType<typeof EventSchema>;

export default (mongoose.models.Event as mongoose.Model<EventDoc>) ||
  mongoose.model<EventDoc>("Event", EventSchema);

