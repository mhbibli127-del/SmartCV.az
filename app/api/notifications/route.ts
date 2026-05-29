import { NextRequest, NextResponse } from "next/server";
import {
  createNotification,
  getUserNotifications,
  markNotificationsRead,
} from "@/lib/notifications";
import { getAuthenticatedUser } from "@/lib/session";
import { handleApiError, unauthorized } from "@/lib/api-errors";
import { parseJsonBody } from "@/lib/safe-route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const notifications = await getUserNotifications(user.email);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    return handleApiError(err, "notifications GET", "Failed to load notifications");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const body = await parseJsonBody<{
      type?: string;
      title?: string;
      message?: string;
    }>(req);
    const { type, title, message } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const notification = await createNotification({
      userId: user.email,
      type: type as "login" | "resume_complete" | "cv_saved" | "system",
      title,
      message,
    });

    return NextResponse.json({ success: true, notification });
  } catch (err) {
    return handleApiError(err, "notifications POST", "Failed to create notification");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return unauthorized();
    }

    const body = await parseJsonBody<{ ids?: string[] }>(req);
    await markNotificationsRead(user.email, body.ids);

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, "notifications PATCH", "Failed to update notifications");
  }
}
