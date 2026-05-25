import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth-options";
import { DatabaseOperations } from "@/lib/models";
import {
  getUserAnalytics,
  parseDateRange,
  type DateRangeKey,
} from "@/lib/analytics-service";

export const dynamic = "force-dynamic";

const VALID_RANGES = new Set(["7d", "30d", "90d", "1y"]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") ?? searchParams.get("date") ?? "7d";
    const range = (VALID_RANGES.has(rangeParam) ? rangeParam : "7d") as DateRangeKey;

    const auth = await getAuthenticatedUser(req);
    const session = auth?.email
      ? { user: { email: auth.email } }
      : await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAnalytics = await getUserAnalytics(session.user.email, range);
    return NextResponse.json(userAnalytics);
  } catch (error) {
    console.error("[analytics GET]", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let userEmail = "anonymous";

    if (process.env.NODE_ENV === "production") {
      const auth = await getAuthenticatedUser(req);
      if (!auth?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userEmail = auth.email;
    } else {
      const auth = await getAuthenticatedUser(req);
      userEmail = auth?.email ?? "dev-user";
    }

    const { eventType, data } = await req.json();
    if (!eventType) {
      return NextResponse.json({ error: "Missing event type" }, { status: 400 });
    }

    await DatabaseOperations.trackInteraction({
      userId: userEmail,
      userEmail,
      action: eventType,
      elementType: data?.elementType || "unknown",
      elementId: data?.elementId,
      page: data?.page || "/",
      metadata: data,
    });

    const today = parseDateRange("7d").start;
    const existing = await DatabaseOperations.getAnalytics(today);
    const analyticsData = {
      totalViews: (existing?.totalViews ?? 0) + (eventType === "page_view" ? 1 : 0),
      totalDownloads:
        (existing?.totalDownloads ?? 0) +
        (["cv_export", "template_download", "cv_created"].includes(eventType) ? 1 : 0),
      totalUsers: existing?.totalUsers ?? 0,
      activeUsers: existing?.activeUsers ?? 0,
      templateViews: existing?.templateViews ?? {},
      templateDownloads: existing?.templateDownloads ?? {},
      popularCategories: existing?.popularCategories ?? {},
      conversionRate: existing?.conversionRate ?? 0,
      avgSessionDuration: existing?.avgSessionDuration ?? 0,
    };

    if (analyticsData.totalViews > 0) {
      analyticsData.conversionRate =
        Math.round((analyticsData.totalDownloads / analyticsData.totalViews) * 1000) / 10;
    }

    await DatabaseOperations.upsertAnalytics(today, analyticsData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[analytics POST]", error);
    return NextResponse.json({ success: true });
  }
}
