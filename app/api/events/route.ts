import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";

export const dynamic = "force-dynamic";

function parseOptionalString(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = parseOptionalString(url.searchParams.get("userId"));
    const eventType = parseOptionalString(url.searchParams.get("eventType"));
    const limitRaw = parseOptionalString(url.searchParams.get("limit"));
    const limit = limitRaw ? Math.min(Math.max(Number(limitRaw), 1), 200) : 50;

    await connectDB();

    const filter: any = {};
    if (userId) (filter as any).userId = userId;
    if (eventType) (filter as any).eventType = eventType;

    const events = await (Event.find(filter) as any)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();


    return NextResponse.json({ events });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[events] GET failed", err);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

