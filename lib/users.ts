import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const USERS_DB_PATH = path.join(process.cwd(), "data", "users_db.json");

export interface LocalUser {
  email: string;
  name: string;
  hash: string;
  salt: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getLocalUsers(): LocalUser[] {
  if (!fs.existsSync(USERS_DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_DB_PATH, "utf-8")) as LocalUser[];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUser[]) {
  fs.mkdirSync(path.dirname(USERS_DB_PATH), { recursive: true });
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2), "utf-8");
}

export function hashPassword(
  password: string,
  salt = crypto.randomBytes(16).toString("hex")
) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 120000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const computedHash = crypto
    .pbkdf2Sync(password, salt, 120000, 64, "sha512")
    .toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, "hex"),
    Buffer.from(hash, "hex")
  );
}

/** Encode legacy pbkdf2 credentials inside the Prisma password column. */
function encodePbkdf2Password(salt: string, hash: string) {
  return `pbkdf2:${salt}:${hash}`;
}

function decodePbkdf2Password(stored: string | null | undefined) {
  if (!stored?.startsWith("pbkdf2:")) return null;
  const [, salt, hash] = stored.split(":");
  if (!salt || !hash) return null;
  return { salt, hash };
}

async function verifyStoredPassword(
  password: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored) return false;
  const legacy = decodePbkdf2Password(stored);
  if (legacy) return verifyPassword(password, legacy.hash, legacy.salt);
  return bcrypt.compare(password, stored);
}

export type UserRecord = LocalUser | Awaited<ReturnType<typeof prisma.user.findUnique>>;

let migrationDone = false;

/** One-time sync from data/users_db.json → Prisma SQLite. */
async function migrateLocalUsersToPrisma() {
  if (migrationDone) return;
  migrationDone = true;

  const localUsers = getLocalUsers();
  if (localUsers.length === 0) return;

  for (const u of localUsers) {
    try {
      await prisma.user.upsert({
        where: { email: u.email },
        create: {
          email: u.email,
          name: u.name,
          password: encodePbkdf2Password(u.salt, u.hash),
          emailVerified: u.verified ? new Date() : null,
        },
        update: {
          name: u.name,
          password: encodePbkdf2Password(u.salt, u.hash),
          ...(u.verified ? { emailVerified: new Date() } : {}),
        },
      });
    } catch (err) {
      console.warn("[users] migration skip", u.email, err);
    }
  }
}

async function mirrorToLocalJson(
  email: string,
  name: string,
  hash: string,
  salt: string,
  verified: boolean
) {
  const users = getLocalUsers();
  const now = new Date().toISOString();
  const idx = users.findIndex((u) => u.email === email);
  const row: LocalUser = {
    email,
    name,
    hash,
    salt,
    verified,
    createdAt: idx >= 0 ? users[idx].createdAt : now,
    updatedAt: now,
  };
  if (idx >= 0) users[idx] = row;
  else users.push(row);
  saveLocalUsers(users);
}

/** Keep Prisma in sync when a user exists only in the JSON backup. */
async function ensurePrismaUserFromLocal(cleanEmail: string) {
  const local = getLocalUsers().find((u) => u.email === cleanEmail);
  if (!local) return null;

  try {
    return await prisma.user.upsert({
      where: { email: cleanEmail },
      create: {
        email: cleanEmail,
        name: local.name,
        password: encodePbkdf2Password(local.salt, local.hash),
        emailVerified: local.verified ? new Date() : null,
      },
      update: {
        name: local.name,
        password: encodePbkdf2Password(local.salt, local.hash),
        ...(local.verified ? { emailVerified: new Date() } : {}),
      },
    });
  } catch (err) {
    console.warn("[users] Could not sync local user to Prisma", cleanEmail, err);
    return local;
  }
}

export async function findUserByEmail(email: string) {
  await migrateLocalUsersToPrisma();
  const cleanEmail = normalizeEmail(email);

  try {
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (user) return user;
    return ensurePrismaUserFromLocal(cleanEmail);
  } catch (err) {
    console.warn("[users] Prisma unavailable, using local JSON", err);
  }

  return getLocalUsers().find((u) => u.email === cleanEmail) ?? null;
}

export async function createOrUpdateUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  await migrateLocalUsersToPrisma();
  const cleanEmail = normalizeEmail(email);
  const { hash, salt } = hashPassword(password);

  try {
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing?.emailVerified) {
      throw new Error("User already exists");
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = existing
      ? await prisma.user.update({
          where: { email: cleanEmail },
          data: { name, password: hashed, emailVerified: null },
        })
      : await prisma.user.create({
          data: {
            email: cleanEmail,
            name,
            password: hashed,
            emailVerified: null,
            provider: "credentials",
          },
        });

    await mirrorToLocalJson(cleanEmail, name, hash, salt, false);
    return user;
  } catch (err) {
    if (err instanceof Error && err.message === "User already exists") throw err;

    // Prisma fallback — local JSON only
    const users = getLocalUsers();
    const existing = users.find((u) => u.email === cleanEmail);
    const now = new Date().toISOString();

    if (existing?.verified) throw new Error("User already exists");

    const row: LocalUser = {
      email: cleanEmail,
      name,
      hash,
      salt,
      verified: false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (existing) {
      saveLocalUsers(users.map((u) => (u.email === cleanEmail ? row : u)));
    } else {
      saveLocalUsers([...users, row]);
    }
    return row;
  }
}

export async function setUserVerified(email: string) {
  await migrateLocalUsersToPrisma();
  const cleanEmail = normalizeEmail(email);

  try {
    const user = await prisma.user.update({
      where: { email: cleanEmail },
      data: { emailVerified: new Date() },
    });

    const local = getLocalUsers().find((u) => u.email === cleanEmail);
    if (local) {
      await mirrorToLocalJson(
        cleanEmail,
        local.name,
        local.hash,
        local.salt,
        true
      );
    }
    return user;
  } catch {
    const users = getLocalUsers();
    const updated = users.map((u) =>
      u.email === cleanEmail
        ? { ...u, verified: true, updatedAt: new Date().toISOString() }
        : u
    );
    saveLocalUsers(updated);
    return updated.find((u) => u.email === cleanEmail) ?? null;
  }
}

export type CredentialCheck =
  | { ok: true; user: UserRecord }
  | { ok: false; reason: "not_found" | "wrong_password" | "unverified" };

export async function checkUserCredentials(
  email: string,
  password: string
): Promise<CredentialCheck> {
  await migrateLocalUsersToPrisma();
  const cleanEmail = normalizeEmail(email);

  try {
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (user) {
      if (!user.password) return { ok: false, reason: "not_found" };
      const valid = await verifyStoredPassword(password, user.password);
      if (!valid) return { ok: false, reason: "wrong_password" };
      if (!user.emailVerified) return { ok: false, reason: "unverified" };
      return { ok: true, user };
    }
  } catch (err) {
    console.warn("[users] Prisma login check failed, trying local JSON", err);
  }

  const local = getLocalUsers().find((u) => u.email === cleanEmail);
  if (!local) return { ok: false, reason: "not_found" };
  if (!verifyPassword(password, local.hash, local.salt)) {
    return { ok: false, reason: "wrong_password" };
  }
  if (!local.verified) return { ok: false, reason: "unverified" };
  return { ok: true, user: local };
}

export async function verifyUserCredentials(email: string, password: string) {
  const result = await checkUserCredentials(email, password);
  return result.ok ? result.user : null;
}

/** Google / OAuth users are always treated as verified. */
export function isUserVerified(user: UserRecord | null): boolean {
  if (!user) return false;
  if ("verified" in user && typeof user.verified === "boolean") {
    return user.verified;
  }
  if ("emailVerified" in user) {
    return Boolean(user.emailVerified);
  }
  return false;
}
