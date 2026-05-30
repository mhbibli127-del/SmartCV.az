import { redirect } from "next/navigation";
import { getAuthenticatedUser, type AuthenticatedUser } from "@/lib/session";

/** Server Component guard — accepts JWT cookies or NextAuth session (matches middleware). */
export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user?.email) {
    redirect("/login");
  }
  return user;
}
