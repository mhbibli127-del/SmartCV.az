import type { ReactNode } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Sign In",
  description: "Sign in to SmartCV.AZ to build and export your professional CV.",
  path: "/login",
  noIndex: true,
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
