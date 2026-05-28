import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy route — gallery lives on Overview */
export default function BuilderPage() {
  redirect("/dashboard");
}
