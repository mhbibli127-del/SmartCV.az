import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth-options";
import { listUserResumes } from "@/lib/resume-service";
import { OverviewGallery } from "@/components/dashboard/OverviewGallery";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Workspace",
  description: "Manage your resumes, edit in Studio, and export professional PDFs.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.email) {
    redirect("/login");
  }

  let resumes: Awaited<ReturnType<typeof listUserResumes>> = [];
  try {
    resumes = await listUserResumes(session.user.email);
  } catch (err) {
    console.error("[dashboard] failed to load resumes", err);
  }

  return (
    <OverviewGallery initialResumes={resumes} userName={session.user.name} />
  );
}
