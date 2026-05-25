import mongoose from "mongoose";

let cached = global as typeof global & {
  mongoosePromise?: Promise<typeof mongoose>;
};

export async function connectMongoose(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (mongoose.connection.readyState === 1) return mongoose;

  if (!cached.mongoosePromise) {
    cached.mongoosePromise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  await cached.mongoosePromise;
  return mongoose;
}
