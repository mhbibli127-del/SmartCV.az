import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function handleUserLogin(email: string) {
  const cleanEmail = String(email).toLowerCase().trim();
  if (!cleanEmail) throw new Error("Email is required");

  await connectDB();

  const existing = await User.findOne({ email: cleanEmail }).exec();
  if (existing) {
    // eslint-disable-next-line no-console
    console.log("🟡 User already exists");
    return existing;
  }

  const created = await User.create({
    email: cleanEmail,
    name: "User",
    // These fields are required by the existing Mongoose schema.
    // For auto-creation on login, we set safe placeholders.
    hash: "",
    salt: "",
    verified: false,
  });

  // eslint-disable-next-line no-console
  console.log("🟢 New user created in MongoDB");

  return created;
}


