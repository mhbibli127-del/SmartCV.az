import mongoose from "mongoose";
import type { Db } from "mongodb";
import { maskMongoUri, requireMongoUri, isMongoConfigured } from "@/lib/env";
import { isMongoCircuitOpen, openMongoCircuit, recordMongoFailure } from "@/lib/db-circuit";

/**
 * Production MongoDB connection for Next.js App Router + Vercel serverless.
 *
 * - Single global cached connection (conn + promise)
 * - Deduplicates concurrent connect attempts
 * - Reconnects after stale/disconnected state
 * - bufferCommands: true — safe query buffering until connected
 * - Guarantees DB handle before returning from getDatabase()
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

const CONNECT_OPTIONS: mongoose.ConnectOptions = {
  bufferCommands: true,
  maxPoolSize: process.env.NODE_ENV === "production" ? 10 : 5,
  minPoolSize: 0,
  serverSelectionTimeoutMS: process.env.NODE_ENV === "production" ? 10_000 : 5_000,
  socketTimeoutMS: 30_000,
  connectTimeoutMS: process.env.NODE_ENV === "production" ? 10_000 : 5_000,
  heartbeatFrequencyMS: 10_000,
  retryWrites: true,
  retryReads: true,
  family: 4,
};

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

function log(message: string, meta?: Record<string, unknown>): void {
  if (!isDev()) return;
  if (isMongoCircuitOpen() && message !== "Connection paused") return;
  // eslint-disable-next-line no-console
  console.log(`[mongodb] ${message}`, meta ?? "");
}

function isConnected(): boolean {
  return mongoose.connection.readyState === 1 && Boolean(mongoose.connection.db);
}

function resetCache(): void {
  cached.conn = null;
  cached.promise = null;
}

let mongoFailureLogged = false;

function logFailureOnce(message: string, meta?: Record<string, unknown>): void {
  if (mongoFailureLogged) return;
  mongoFailureLogged = true;
  // eslint-disable-next-line no-console
  console.warn(`[mongodb] ${message}`, meta ?? "");
}

async function createConnection(): Promise<typeof mongoose> {
  if (!isMongoConfigured()) {
    throw new Error("[mongodb] MONGODB_URI is not configured");
  }
  const uri = requireMongoUri();
  const safeUri = maskMongoUri(uri);

  log("Connecting...", { uri: safeUri });

  mongoose.set("strictQuery", true);

  try {
    const instance = await mongoose.connect(uri, CONNECT_OPTIONS);

    if (!mongoose.connection.db) {
      await waitForDbHandle(5_000);
    }

    cached.conn = instance;

    log("Connected", {
      host: mongoose.connection.host,
      db: mongoose.connection.name,
    });

    mongoose.connection.on("disconnected", () => {
      log("Disconnected — cache cleared for next request");
      resetCache();
    });

    mongoose.connection.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("[mongodb] Connection error:", err.message);
      resetCache();
    });

    return instance;
  } catch (err) {
    resetCache();
    const message = err instanceof Error ? err.message : String(err);
    logFailureOnce("Connection failed — circuit open for 5 min", { error: message });
    throw err;
  }
}

/** Wait until mongoose.connection.db is available */
function waitForDbHandle(timeoutMs: number): Promise<void> {
  if (mongoose.connection.db) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const tryResolve = () => {
      if (mongoose.connection.db) {
        resolve();
        return true;
      }
      if (Date.now() >= deadline) {
        reject(new Error("[mongodb] Database handle unavailable after connect"));
        return true;
      }
      return false;
    };

    if (tryResolve()) return;

    const interval = setInterval(() => {
      if (tryResolve()) clearInterval(interval);
    }, 50);

    mongoose.connection.once("connected", () => {
      if (tryResolve()) clearInterval(interval);
    });

    mongoose.connection.once("error", (err) => {
      clearInterval(interval);
      reject(err);
    });
  });
}

/**
 * Connect to MongoDB Atlas — cached, idempotent, serverless-safe.
 * Always await this before Mongoose queries or getDatabase().
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (!isMongoConfigured()) {
    throw new Error("[mongodb] Not configured — set MONGODB_URI or disable Mongo features");
  }

  if (isMongoCircuitOpen()) {
    throw new Error("[mongodb] Connection paused (circuit open)");
  }

  if (isConnected() && cached.conn) {
    log("Reusing connection", {
      host: mongoose.connection.host,
      db: mongoose.connection.name,
    });
    return cached.conn;
  }

  const state = mongoose.connection.readyState;

  // Stale or closed — start fresh
  if (state === 0 || state === 3) {
    resetCache();
  }

  // Another invocation is connecting — wait for it
  if (state === 2 && cached.promise) {
    log("Awaiting in-flight connection...");
    return cached.promise;
  }

  if (!cached.promise) {
    cached.promise = createConnection();
  }

  try {
    const conn = await cached.promise;
    return conn;
  } catch (err) {
    resetCache();
    recordMongoFailure(err);
    openMongoCircuit();
    throw err;
  }
}

/** Backward-compatible alias used by cv-service and legacy imports */
export const connectMongoose = connectDB;

/**
 * Native MongoDB Db handle for direct driver operations (lib/models.ts, etc.)
 */
export async function getDatabase(): Promise<Db> {
  if (!isMongoConfigured()) {
    throw new Error("[mongodb] Not configured");
  }
  if (isMongoCircuitOpen()) {
    throw new Error("[mongodb] Connection paused (circuit open)");
  }

  await connectDB();

  if (mongoose.connection.db) {
    return mongoose.connection.db;
  }

  await waitForDbHandle(5_000);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("[mongodb] Database handle unavailable after connect");
  }

  return db;
}

/** Health-check helper */
export async function pingDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  const db = await getDatabase();
  await db.command({ ping: 1 });
  return { ok: true, latencyMs: Date.now() - start };
}

export function getMongoConnectionState(): {
  readyState: number;
  connected: boolean;
  host?: string;
  name?: string;
} {
  return {
    readyState: mongoose.connection.readyState,
    connected: isConnected(),
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
}

export default connectDB;
