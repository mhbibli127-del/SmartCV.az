import { promises as fs } from "fs";
import path from "path";
import { ObjectId } from "mongodb";
import { getDatabase } from "./mongodb";

export type NotificationType =
  | "login"
  | "resume_complete"
  | "cv_saved"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "notifications.json");

async function readFileStore(): Promise<AppNotification[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

async function writeFileStore(items: AppNotification[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}) {
  const record: AppNotification = {
    id: new ObjectId().toString(),
    userId: input.userId.toLowerCase().trim(),
    type: input.type,
    title: input.title,
    message: input.message,
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const db = await getDatabase();
    await db.collection("notifications").insertOne({
      ...record,
      _id: new ObjectId(record.id),
      createdAt: new Date(record.createdAt),
    });
  } catch {
    const items = await readFileStore();
    items.unshift(record);
    await writeFileStore(items.slice(0, 200));
  }

  return record;
}

export async function getUserNotifications(
  userId: string,
  limit = 30
): Promise<AppNotification[]> {
  const normalized = userId.toLowerCase().trim();

  try {
    const db = await getDatabase();
    const docs = await db
      .collection("notifications")
      .find({ userId: normalized })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map((doc) => ({
      id: doc._id?.toString() || String(doc.id),
      userId: doc.userId,
      type: doc.type as NotificationType,
      title: doc.title,
      message: doc.message,
      read: Boolean(doc.read),
      createdAt:
        doc.createdAt instanceof Date
          ? doc.createdAt.toISOString()
          : String(doc.createdAt),
    }));
  } catch {
    const items = await readFileStore();
    return items.filter((n) => n.userId === normalized).slice(0, limit);
  }
}

export async function markNotificationsRead(
  userId: string,
  ids?: string[]
) {
  const normalized = userId.toLowerCase().trim();

  try {
    const db = await getDatabase();
    const filter: Record<string, unknown> = { userId: normalized };
    if (ids?.length) {
      filter._id = { $in: ids.map((id) => new ObjectId(id)) };
    }
    await db.collection("notifications").updateMany(filter, {
      $set: { read: true },
    });
  } catch {
    const items = await readFileStore();
    const updated = items.map((n) => {
      if (n.userId !== normalized) return n;
      if (ids?.length && !ids.includes(n.id)) return n;
      return { ...n, read: true };
    });
    await writeFileStore(updated);
  }
}

export const notificationMessages = {
  login: {
    title: "Welcome back!",
    message: "You have successfully signed in to SmartCV.",
  },
  resumeComplete: {
    title: "Resume completed",
    message: "Your CV is ready. You can download or continue editing anytime.",
  },
  cvSaved: {
    title: "CV saved",
    message: "Your latest changes were saved successfully.",
  },
};
