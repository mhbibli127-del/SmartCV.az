/**
 * Student verification — studentId + email domain + admin approval ONLY.
 */

export type VerificationStatus = "none" | "pending" | "verified" | "rejected";

/** 5–20 chars, letters and digits only. */
const STUDENT_ID_PATTERN = /^[A-Za-z0-9]{5,20}$/;

/** Common academic email suffixes (optional auto-hint for admins). */
const UNIVERSITY_DOMAIN_PATTERNS = [
  /\.edu$/i,
  /\.edu\.[a-z]{2}$/i,
  /\.ac\.[a-z]{2}$/i,
  /\.uni\.[a-z]{2}$/i,
  /university/i,
  /\.edu\.az$/i,
  /\.edu\.tr$/i,
];

export type StudentIdValidation =
  | { ok: true; normalized: string }
  | { ok: false; error: string };

export function validateStudentId(raw: string): StudentIdValidation {
  const normalized = raw.trim().toUpperCase();

  if (!normalized) {
    return { ok: false, error: "Student ID is required." };
  }

  if (normalized.length < 5 || normalized.length > 20) {
    return {
      ok: false,
      error: "Student ID must be between 5 and 20 characters.",
    };
  }

  if (!STUDENT_ID_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: "Student ID may only contain letters and numbers (A–Z, 0–9).",
    };
  }

  return { ok: true, normalized };
}

export function extractEmailDomain(email: string): string {
  const parts = email.trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

export function isUniversityEmailDomain(email: string): boolean {
  const domain = extractEmailDomain(email);
  if (!domain) return false;
  return UNIVERSITY_DOMAIN_PATTERNS.some((re) => re.test(domain));
}

export type DomainCheckResult = {
  domain: string;
  isUniversityDomain: boolean;
  /** Admins may fast-track; never auto-verifies without approval by default. */
  adminHint: string | null;
};

export function checkStudentEmailDomain(email: string): DomainCheckResult {
  const domain = extractEmailDomain(email);
  const isUniversityDomain = isUniversityEmailDomain(email);

  return {
    domain,
    isUniversityDomain,
    adminHint: isUniversityDomain
      ? "Email uses a recognized university domain — eligible for expedited review."
      : null,
  };
}

export function canAccessStudentPlan(params: {
  plan: string;
  studentVerified: boolean;
  verificationStatus: VerificationStatus | string;
}): boolean {
  if (params.plan !== "student") return true;
  return (
    params.studentVerified === true && params.verificationStatus === "verified"
  );
}
