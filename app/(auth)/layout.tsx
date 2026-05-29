import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo/metadata";

/** Auth pages: /login, /register, /register/otp, /verify-otp */
export const metadata = createPageMetadata({
  title: "Sign In",
  description: "Sign in to SmartCV.AZ to build, optimize, and export your CV.",
  path: "/login",
  noIndex: true,
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
