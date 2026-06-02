import HomePage from "@/components/marketing/HomePage";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "SmartCV.AZ",
  description:
    "Create professional CVs with templates, Studio editor, and PDF export.",
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
