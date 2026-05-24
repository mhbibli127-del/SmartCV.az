import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import type { Types } from "mongoose";

export type LogEventInput = {
  userId?: string | Types.ObjectId | null;

  eventType: string;
  message: string;
  // Avoid passing arbitrary objects to Mongoose `metadata` typing issues.
  metadata?: unknown | null;
};


export async function logEvent(input: LogEventInput) {
  try {
    await connectDB();

    const { userId, eventType, message, metadata } = input;

    const event = await Event.create({
      userId: userId ?? undefined,
      eventType,
      message,
      // Store arbitrary metadata.
      metadata: (metadata ?? undefined) as any,
    } as any);



    // eslint-disable-next-line no-console
    console.log(`🟣 EVENT: ${eventType}${userId ? ` by user ${userId}` : ""}`);

    return event;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("🔴 Failed to log event", err);
    return null;
  }
}

