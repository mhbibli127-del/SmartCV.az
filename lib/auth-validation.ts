export const AUTH_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  passwordMin: 8,
  passwordMax: 72,
  otpLength: 6,
} as const;

export type AuthField = "email" | "password" | "confirmPassword" | "name" | "otp";

export type AuthValidationIssue = {
  field: AuthField;
  code: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): AuthValidationIssue | null {
  const v = email.trim();
  if (!v) return { field: "email", code: "email_required" };
  if (v.length > 254) return { field: "email", code: "email_too_long" };
  if (!EMAIL_RE.test(v)) return { field: "email", code: "email_invalid" };
  return null;
}

export function validatePassword(password: string): AuthValidationIssue[] {
  const issues: AuthValidationIssue[] = [];
  if (!password) {
    issues.push({ field: "password", code: "password_required" });
    return issues;
  }
  if (password.length < AUTH_LIMITS.passwordMin) {
    issues.push({ field: "password", code: "password_too_short" });
  }
  if (password.length > AUTH_LIMITS.passwordMax) {
    issues.push({ field: "password", code: "password_too_long" });
  }
  if (!/[a-zA-Z]/.test(password)) {
    issues.push({ field: "password", code: "password_needs_letter" });
  }
  if (!/[0-9]/.test(password)) {
    issues.push({ field: "password", code: "password_needs_digit" });
  }
  return issues;
}

export function validateName(name: string): AuthValidationIssue | null {
  const v = name.trim();
  if (!v) return { field: "name", code: "name_required" };
  if (v.length < AUTH_LIMITS.nameMin) return { field: "name", code: "name_too_short" };
  if (v.length > AUTH_LIMITS.nameMax) return { field: "name", code: "name_too_long" };
  return null;
}

export function validateRegisterForm(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): AuthValidationIssue[] {
  const issues: AuthValidationIssue[] = [];
  const nameIssue = validateName(input.name);
  if (nameIssue) issues.push(nameIssue);
  const emailIssue = validateEmail(input.email);
  if (emailIssue) issues.push(emailIssue);
  issues.push(...validatePassword(input.password));
  if (input.password !== input.confirmPassword) {
    issues.push({ field: "confirmPassword", code: "password_mismatch" });
  }
  return issues;
}

export function validateLoginForm(input: {
  email: string;
  password: string;
}): AuthValidationIssue[] {
  const issues: AuthValidationIssue[] = [];
  const emailIssue = validateEmail(input.email);
  if (emailIssue) issues.push(emailIssue);
  if (!input.password) {
    issues.push({ field: "password", code: "password_required" });
  }
  return issues;
}

/** Server-side messages (API) — Azerbaijani default */
export function authIssueToMessage(issue: AuthValidationIssue): string {
  const map: Record<string, string> = {
    email_required: "Email daxil edin.",
    email_invalid: "Email formatı düzgün deyil.",
    email_too_long: "Email çox uzundur.",
    password_required: "Parol daxil edin.",
    password_too_short: `Parol ən azı ${AUTH_LIMITS.passwordMin} simvol olmalıdır.`,
    password_too_long: `Parol ən çoxu ${AUTH_LIMITS.passwordMax} simvol ola bilər.`,
    password_needs_letter: "Parolda ən azı bir hərf olmalıdır.",
    password_needs_digit: "Parolda ən azı bir rəqəm olmalıdır.",
    password_mismatch: "Parollar uyğun deyil.",
    name_required: "Ad və soyad daxil edin.",
    name_too_short: `Ad ən azı ${AUTH_LIMITS.nameMin} simvol olmalıdır.`,
    name_too_long: "Ad çox uzundur.",
  };
  return map[issue.code] ?? "Məlumat düzgün deyil.";
}
