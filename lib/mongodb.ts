import mongoose from "mongoose";
import { maskMongoUri, requireMongoUri } from "@/lib/env";

/**
 * Vercel serverless-safe Mongoose connection cache.
 * Reuses a single connection across warm lambda invocations.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.__mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.__mongooseCache) {
  global.__mongooseCache = cached;
}

/**
 * Connect to MongoDB using MONGODB_URI from environment.
 * - Validates URI before connecting
 * - Reuses existing connection when already connected
 * - Deduplicates concurrent connect attempts
 */
export async function connectDB(): Promise<typeof mongoose> {
  const uri = requireMongoUri();
  const safeUri = maskMongoUri(uri);

  if (cached.conn && mongoose.connection.readyState === 1) {
    // eslint-disable-next-line no-console
    console.log("[mongodb] Reusing existing connection", {
      host: mongoose.connection.host,
      db: mongoose.connection.name,
    });
    return cached.conn;
  }

  if (cached.promise) {
    // eslint-disable-next-line no-console
    console.log("[mongodb] Awaiting in-flight connection...");
    return cached.promise;
  }

  // eslint-disable-next-line no-console
  console.log("[mongodb] Connecting...", { uri: safeUri });

  cached.promise = (async () => {
    try {
      mongoose.set("strictQuery", true);

      const connection = await mongoose.connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
        socketTimeoutMS: 45_000,
      });

      cached.conn = connection;

      // eslint-disable-next-line no-console
      console.log("[mongodb] Connected successfully", {
        host: mongoose.connection.host,
        db: mongoose.connection.name,
        uri: safeUri,
      });

      return connection;
    } catch (err) {
      cached.promise = null;
      cached.conn = null;

      const message = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error("[mongodb] Connection failed", {
        uri: safeUri,
        error: message,
      });

      throw err;
    }
  })();

  return cached.promise;
}

/**
 * Returns the native MongoDB Db handle (used by lib/models.ts, lib/notifications.ts).
 */
export async function getDatabase() {
  await connectDB();

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("[mongodb] Database handle unavailable after connect");
  }

  return db;
}
