import { redirect } from "next/navigation";

/** Legacy URL — CV creation lives in Studio. */
export default function GeneratorRedirectPage() {
  redirect("/dashboard/studio");
}
