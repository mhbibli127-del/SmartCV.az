/**
 * Supabase PostgreSQL URL normalization for Prisma.
 * - DATABASE_URL → pooler :6543 + ?pgbouncer=true (runtime / serverless)
 * - DIRECT_URL   → db.*.supabase.co :5432 (migrations, introspection)
 */

export function isPostgresUrlConfigured(url: string): boolean {
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

export type PostgresUrlValidation = {
  ok: boolean;
  reason?: string;
  hints?: string[];
};

function parsePostgresUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/** True when URL has userinfo with a password segment. */
export function postgresUrlHasPassword(url: string): boolean {
  const parsed = parsePostgresUrl(url);
  if (!parsed?.password) return false;
  return parsed.password.length > 0;
}

export function isSupabasePoolerUrl(url: string): boolean {
  const parsed = parsePostgresUrl(url);
  if (!parsed) return false;
  return (
    parsed.hostname.includes("pooler.supabase.com") ||
    parsed.port === "6543"
  );
}

export function isSupabaseDirectUrl(url: string): boolean {
  const parsed = parsePostgresUrl(url);
  if (!parsed) return false;
  return (
    parsed.hostname.startsWith("db.") &&
    parsed.hostname.endsWith(".supabase.co") &&
    (parsed.port === "5432" || parsed.port === "")
  );
}

/** Append required query params without duplicating. */
export function enhancePostgresUrl(
  url: string,
  mode: "pooler" | "direct"
): string {
  const parsed = parsePostgresUrl(url);
  if (!parsed) return url;

  if (mode === "pooler" || isSupabasePoolerUrl(url)) {
    parsed.searchParams.set("pgbouncer", "true");
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", "1");
    }
  }

  if (
    parsed.hostname.includes("supabase.co") &&
    !parsed.searchParams.has("sslmode")
  ) {
    parsed.searchParams.set("sslmode", "require");
  }

  return parsed.toString();
}

export function validatePostgresEnv(
  databaseUrl: string | null | undefined,
  directUrl: string | null | undefined
): PostgresUrlValidation {
  const hints: string[] = [];

  if (!databaseUrl?.trim()) {
    return {
      ok: false,
      reason: "DATABASE_URL is not set",
      hints: [
        "Copy .env.example → .env.local and set Supabase pooler URL (port 6543).",
      ],
    };
  }

  const db = databaseUrl.trim();
  if (!db.startsWith("postgresql://") && !db.startsWith("postgres://")) {
    return { ok: false, reason: "DATABASE_URL must use postgresql:// scheme" };
  }

  if (!postgresUrlHasPassword(db)) {
    return {
      ok: false,
      reason: "DATABASE_URL is missing the database password",
      hints: [
        "Format: postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@...pooler...:6543/postgres?pgbouncer=true",
        "Encode special characters (@ → %40, ! → %21).",
      ],
    };
  }

  if (db.includes("[YOUR-PASSWORD]") || db.includes("USER:PASSWORD")) {
    return { ok: false, reason: "DATABASE_URL still contains a placeholder password" };
  }

  if (!isSupabasePoolerUrl(db)) {
    hints.push(
      "For Vercel/serverless, DATABASE_URL should use Supabase pooler host :6543 with ?pgbouncer=true"
    );
  } else if (!db.includes("pgbouncer=true")) {
    hints.push("Add ?pgbouncer=true to DATABASE_URL when using port 6543");
  }

  const direct = directUrl?.trim();
  if (!direct) {
    return {
      ok: false,
      reason: "DIRECT_URL is not set (required for Prisma migrations)",
      hints: [
        "Set DIRECT_URL to db.PROJECT_REF.supabase.co:5432 (not the pooler host).",
      ],
    };
  }

  if (!postgresUrlHasPassword(direct)) {
    return {
      ok: false,
      reason: "DIRECT_URL is missing the database password",
    };
  }

  const directParsed = parsePostgresUrl(direct);
  if (directParsed && isSupabasePoolerUrl(direct)) {
    if (directParsed.port === "6543") {
      return {
        ok: false,
        reason: "DIRECT_URL must not use transaction pooler port 6543",
        hints: ["Use db.*.supabase.co:5432 or session pooler :5432 for migrations."],
      };
    }
    // Session pooler :5432 — allowed when db.* is unreachable (common on local networks).
    hints.push(
      "DIRECT_URL uses session pooler :5432 — OK for migrations; prefer db.*.supabase.co on Vercel CI."
    );
  } else if (direct.includes("pooler.supabase.com")) {
    return {
      ok: false,
      reason: "DIRECT_URL points at pooler.supabase.com without port 5432",
    };
  }

  return { ok: true, hints: hints.length ? hints : undefined };
}

export function resolveDatabaseUrlsFromEnv(): {
  databaseUrl: string;
  directUrl: string;
} {
  const rawDb = process.env.DATABASE_URL?.trim();
  const rawDirect = process.env.DIRECT_URL?.trim();

  if (!rawDb) {
    throw new Error("[database] DATABASE_URL is not set");
  }

  const validation = validatePostgresEnv(rawDb, rawDirect);
  if (!validation.ok) {
    const hint = validation.hints?.length ? ` ${validation.hints.join(" ")}` : "";
    throw new Error(`[database] ${validation.reason}.${hint}`);
  }

  const databaseUrl = enhancePostgresUrl(rawDb, "pooler");
  const directUrl = enhancePostgresUrl(rawDirect!, "direct");

  return { databaseUrl, directUrl };
}
