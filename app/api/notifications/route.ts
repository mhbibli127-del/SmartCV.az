import { NextRequest, NextResponse } from "next/server";
import {
  createNotification,
  getUserNotifications,
  markNotificationsRead,
} from "@/lib/notifications";
import { getAuthenticatedUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getUserNotifications(user.email);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, title, message } = body;

  if (!type || !title || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const notification = await createNotification({
    userId: user.email,
    type,
    title,
    message,
  });

  return NextResponse.json({ success: true, notification });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await req.json();
  await markNotificationsRead(user.email, ids);

  return NextResponse.json({ success: true });
}
