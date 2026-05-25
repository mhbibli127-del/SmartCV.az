/**
 * MongoDB SaaS user service — subscription state source of truth.
 * All plan/limit logic is server-side; Paddle webhook updates this store.
 */
import { connectDB } from "@/lib/mongodb";
import SaasUser, { type ISaasUser } from "@/models/SaasUser";
import {
  getCvLimitForPlan,
  isUnlimitedCvLimit,
  type SubscriptionStatus,
  type UserPlan,
} from "@/lib/user-plans";

export const CV_LIMIT_ERROR = "CV limit reached. Upgrade required.";

export type SaasUserRecord = {
  email: string;
  name: string;
  plan: UserPlan;
  cvUsed: number;
  cvLimit: number;
  status: SubscriptionStatus;
  paddleSubscriptionId?: string;
  createdAt: Date;
};

export type CVLimitCheck =
  | { allowed: true; user: SaasUserRecord }
  | { allowed: false; error: string; code: "CV_LIMIT_REACHED"; user: SaasUserRecord };

function toRecord(doc: ISaasUser): SaasUserRecord {
  return {
    email: doc.email,
    name: doc.name,
    plan: doc.plan as UserPlan,
    cvUsed: doc.cvUsed,
    cvLimit: doc.cvLimit,
    status: doc.status as SubscriptionStatus,
    paddleSubscriptionId: doc.paddleSubscriptionId,
    createdAt: doc.createdAt,
  };
}

/** Ensure Mongo connection before any operation. */
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

/** Find user by email — returns null if not found. Throws on DB errors. */
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

/** Create user on first auth (Google / register). Idempotent. */
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
          plan: "free" as UserPlan,
          cvUsed: 0,
          cvLimit: getCvLimitForPlan("free"),
          status: "active" as SubscriptionStatus,
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

/**
 * Core CV limit check — MUST be called before any CV creation.
 * Blocks when cvUsed >= cvLimit (pro/unlimited exempt).
 */
export function checkCVLimit(user: SaasUserRecord): CVLimitCheck {
  if (user.plan === "pro" || isUnlimitedCvLimit(user.cvLimit)) {
    return { allowed: true, user };
  }
  if (user.cvUsed >= user.cvLimit) {
    return {
      allowed: false,
      error: CV_LIMIT_ERROR,
      code: "CV_LIMIT_REACHED",
      user,
    };
  }
  return { allowed: true, user };
}

/** Fetch user from DB and run checkCVLimit. */
export async function assertCVLimit(email: string): Promise<CVLimitCheck> {
  const user = await findSaasUserByEmail(email);
  if (!user) {
    // Fail open for brand-new users not yet synced — treat as free tier
    const fallback: SaasUserRecord = {
      email: email.trim().toLowerCase(),
      name: "User",
      plan: "free",
      cvUsed: 0,
      cvLimit: getCvLimitForPlan("free"),
      status: "active",
      createdAt: new Date(),
    };
    return checkCVLimit(fallback);
  }
  return checkCVLimit(user);
}

/** Increment cvUsed after successful CV creation. */
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

/** Recount CVs from Mongo CV collection and sync cvUsed. */
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

/** Apply plan from Paddle webhook — ONLY source of truth for billing. */
export async function applySubscriptionFromWebhook(params: {
  email: string;
  plan: UserPlan;
  status?: SubscriptionStatus;
  paddleSubscriptionId?: string;
  paddleCustomerId?: string;
}): Promise<SaasUserRecord | null> {
  const email = params.email.trim().toLowerCase();
  const cvLimit = getCvLimitForPlan(params.plan);

  try {
    const Model = await db();
    const doc = await Model.findOneAndUpdate(
      { email },
      {
        $set: {
          plan: params.plan,
          cvLimit,
          status: params.status ?? "active",
          ...(params.paddleSubscriptionId && {
            paddleSubscriptionId: params.paddleSubscriptionId,
          }),
          ...(params.paddleCustomerId && {
            paddleCustomerId: params.paddleCustomerId,
          }),
        },
        $setOnInsert: {
          email,
          name: email.split("@")[0],
          cvUsed: 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(
      `[saas-user] Webhook applied plan=${params.plan} cvLimit=${cvLimit} email=${email}`
    );
    if (!doc) throw new SaasUserDbError("Failed to apply subscription");
    return toRecord(doc);
  } catch (err) {
    console.error("[saas-user] applySubscription failed:", err);
    throw err instanceof SaasUserDbError ? err : new SaasUserDbError();
  }
}

/** Downgrade to free on subscription cancel. */
export async function downgradeToFree(params: {
  email?: string;
  paddleSubscriptionId?: string;
}): Promise<SaasUserRecord | null> {
  try {
    const Model = await db();
    const filter = params.email
      ? { email: params.email.trim().toLowerCase() }
      : params.paddleSubscriptionId
        ? { paddleSubscriptionId: params.paddleSubscriptionId }
        : null;

    if (!filter) return null;

    const doc = await Model.findOneAndUpdate(
      filter,
      {
        $set: {
          plan: "free",
          cvLimit: getCvLimitForPlan("free"),
          status: "active",
        },
      },
      { new: true }
    );
    return doc ? toRecord(doc) : null;
  } catch (err) {
    console.error("[saas-user] downgradeToFree failed:", err);
    return null;
  }
}

/** Mark past_due on payment failure. */
export async function markPastDue(params: {
  email?: string;
  paddleSubscriptionId?: string;
}): Promise<void> {
  try {
    const Model = await db();
    const filter = params.email
      ? { email: params.email.trim().toLowerCase() }
      : params.paddleSubscriptionId
        ? { paddleSubscriptionId: params.paddleSubscriptionId }
        : null;
    if (!filter) return;
    await Model.updateOne(filter, { $set: { status: "past_due" } });
  } catch (err) {
    console.error("[saas-user] markPastDue failed:", err);
  }
}

/** Admin: list all SaaS users. */
export async function listAllSaasUsers(): Promise<SaasUserRecord[]> {
  try {
    const Model = await db();
    const docs = await Model.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) =>
      toRecord(d as unknown as ISaasUser)
    );
  } catch (err) {
    console.error("[saas-user] listAll failed:", err);
    return [];
  }
}

/** Admin analytics aggregates. */
export async function getSaasAnalytics() {
  try {
    const Model = await db();
    const [totalUsers, activeBasic, activePro, pastDue, usageAgg] =
      await Promise.all([
        Model.countDocuments(),
        Model.countDocuments({ plan: "basic", status: "active" }),
        Model.countDocuments({ plan: "pro", status: "active" }),
        Model.countDocuments({ status: "past_due" }),
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

    const revenueEstimate =
      activeBasic * 3.99 + activePro * 9.99;

    return {
      totalUsers,
      activeSubscriptions: activeBasic + activePro,
      activeBasic,
      activePro,
      pastDue,
      revenueEstimate: Math.round(revenueEstimate * 100) / 100,
      totalCvUsed: usageAgg[0]?.totalCvUsed ?? 0,
      avgCvUsed: Math.round((usageAgg[0]?.avgCvUsed ?? 0) * 10) / 10,
    };
  } catch (err) {
    console.error("[saas-user] analytics failed:", err);
    return {
      totalUsers: 0,
      activeSubscriptions: 0,
      activeBasic: 0,
      activePro: 0,
      pastDue: 0,
      revenueEstimate: 0,
      totalCvUsed: 0,
      avgCvUsed: 0,
    };
  }
}
