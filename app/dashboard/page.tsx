import { listUserResumes } from "@/lib/resume-service";
import { OverviewGallery } from "@/components/dashboard/OverviewGallery";
import { createPageMetadata } from "@/lib/seo/metadata";
import { requireAuthenticatedUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Workspace",
  description: "Manage your resumes, edit in Studio, and export professional PDFs.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  let resumes: Awaited<ReturnType<typeof listUserResumes>> = [];
  try {
    resumes = await listUserResumes(user.email);
  } catch (err) {
    console.error("[dashboard] failed to load resumes", err);
  }

  return (
    <OverviewGallery initialResumes={resumes} userName={user.name} />
  );
}
