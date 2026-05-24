import mongoose from "mongoose";
import { getMongoUri } from "@/lib/env";

let warnedMissingEnv = false;

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = {
  conn: null,
  promise: null,
};

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URL = getMongoUri();
  if (!MONGODB_URL) {
    if (!warnedMissingEnv) {
      warnedMissingEnv = true;
      // eslint-disable-next-line no-console
      console.warn(
        "[mongodb] MONGODB_URI is not set or contains a placeholder. " +
          "MongoDB-backed features will be unavailable."
      );
    }
    throw new Error(
      "[mongodb] MONGODB_URI is not configured. Set it in .env.local."
    );
  }

  const readyState = mongoose.connection.readyState;
  if (readyState === 1 && cached.conn) {
    console.log("🟢 MongoDB already connected");
    return cached.conn;
  }

  if (cached.promise) {
    return cached.promise;
  }

  cached.promise = (async () => {
    try {
      console.log("🔵 Trying to connect MongoDB...");
      mongoose.set("strictQuery", true);

      await mongoose.connect(MONGODB_URL, {
        dbName: mongoose.connection.name || undefined,
      } as mongoose.ConnectOptions);

      console.log("🟢 MongoDB connected successfully");
      cached.conn = mongoose;
      return mongoose;
    } catch (err) {
      console.error("🔴 MongoDB connection error", err);
      cached.promise = null;
      throw err;
    }
  })();

  return cached.promise;
}

/**
 * Compatibility export expected by lib/notifications.ts and lib/models.ts.
 *
 * This returns a native MongoDB DB handle via mongoose's underlying connection.
 */
export async function getDatabase() {
  const m = await connectDB();
  // mongoose.connection.db is the native mongodb Db instance
  const db = m.connection.db;
  if (!db) {
    throw new Error("MongoDB native Db handle is not available yet");
  }
  return db;
}

