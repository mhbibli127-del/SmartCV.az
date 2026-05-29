/**
 * MongoDB SaaS user — usage tracking only (no billing or limits).
 */
import { connectDB } from "@/lib/mongodb";
import SaasUser, { type ISaasUser } from "@/models/SaasUser";
import { UNLIMITED_CV_LIMIT, type SubscriptionStatus, type UserPlan } from "@/lib/user-plans";

export type SaasUserRecord = {
  email: string;
  name: string;
  plan: UserPlan;
  cvUsed: number;
  cvLimit: number;
  status: SubscriptionStatus;
  createdAt: Date;
};

export type CVLimitCheck = { allowed: true; user: SaasUserRecord };

function toRecord(doc: ISaasUser): SaasUserRecord {
  return {
    email: doc.email,
    name: doc.name,
    plan: "free",
    cvUsed: doc.cvUsed,
    cvLimit: UNLIMITED_CV_LIMIT,
    status: "active",
    createdAt: doc.createdAt,
  };
}

async function db() {
  await connectDB();
  return SaasUser;
}

export class SaasUserDbError extends Error {
  constructor(message = "Database unavailable") {
    super(message);
    this.name = "SaasUserDbError";
  }
}

export async function findSaasUserByEmail(
  email: string
): Promise<SaasUserRecord | null> {
  try {
    const Model = await db();
    const doc = await Model.findOne({ email: email.trim().toLowerCase() });
    return doc ? toRecord(doc) : null;
  } catch (err) {
    console.error("[saas-user] findByEmail failed:", err);
    throw new SaasUserDbError();
  }
}

export async function upsertSaasUserOnAuth(params: {
  email: string;
  name?: string | null;
}): Promise<SaasUserRecord | null> {
  const email = params.email.trim().toLowerCase();
  const name = params.name?.trim() || email.split("@")[0] || "User";

  try {
    const Model = await db();
    const doc = await Model.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          email,
          name,
          plan: "free",
          cvUsed: 0,
          cvLimit: UNLIMITED_CV_LIMIT,
          status: "active",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return doc ? toRecord(doc) : null;
  } catch (err) {
    console.error("[saas-user] upsertOnAuth failed:", err);
    return null;
  }
}

export function checkCVLimit(user: SaasUserRecord): CVLimitCheck {
  return { allowed: true, user };
}

export async function assertCVLimit(email: string): Promise<CVLimitCheck> {
  const user = await findSaasUserByEmail(email);
  if (user) return { allowed: true, user };

  return {
    allowed: true,
    user: {
      email: email.trim().toLowerCase(),
      name: "User",
      plan: "free",
      cvUsed: 0,
      cvLimit: UNLIMITED_CV_LIMIT,
      status: "active",
      createdAt: new Date(),
    },
  };
}

export async function incrementCvUsed(email: string): Promise<number> {
  try {
    const Model = await db();
    const doc = await Model.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { $inc: { cvUsed: 1 } },
      { new: true }
    );
    return doc?.cvUsed ?? 0;
  } catch (err) {
    console.error("[saas-user] incrementCvUsed failed:", err);
    return 0;
  }
}

export async function syncCvUsedFromCount(
  email: string,
  count: number
): Promise<void> {
  try {
    const Model = await db();
    await Model.updateOne(
      { email: email.trim().toLowerCase() },
      { $set: { cvUsed: count } }
    );
  } catch (err) {
    console.error("[saas-user] syncCvUsed failed:", err);
  }
}

export async function listAllSaasUsers(): Promise<SaasUserRecord[]> {
  try {
    const Model = await db();
    const docs = await Model.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) => toRecord(d as unknown as ISaasUser));
  } catch (err) {
    console.error("[saas-user] listAll failed:", err);
    return [];
  }
}

export async function getSaasAnalytics() {
  try {
    const Model = await db();
    const [totalUsers, usageAgg] = await Promise.all([
      Model.countDocuments(),
      Model.aggregate([
        {
          $group: {
            _id: null,
            totalCvUsed: { $sum: "$cvUsed" },
            avgCvUsed: { $avg: "$cvUsed" },
          },
        },
      ]),
    ]);

    return {
      totalUsers,
      totalCvUsed: usageAgg[0]?.totalCvUsed ?? 0,
      avgCvUsed: Math.round((usageAgg[0]?.avgCvUsed ?? 0) * 10) / 10,
    };
  } catch (err) {
    console.error("[saas-user] analytics failed:", err);
    return { totalUsers: 0, totalCvUsed: 0, avgCvUsed: 0 };
  }
}
