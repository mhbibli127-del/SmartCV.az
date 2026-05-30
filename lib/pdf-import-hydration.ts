import { generatorDataToSections } from "@/lib/cv-hydration";
import type { CVSection } from "@/types/cv-document";
import type { PdfImportPayload } from "@/types/pdf-import";

/** Map parsed PDF fields into builder sections for Studio. */
export function pdfImportToSections(data: PdfImportPayload): CVSection[] {
  const skills =
    data.skills ??
    (typeof data.rawSkills === "string"
      ? data.rawSkills.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
      : []);

  return generatorDataToSections({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    location: data.location,
    website: data.website,
    title: data.title,
    summary: data.summary ?? data.rawExperience,
    skills,
    experience: data.experience,
    education: data.education,
  });
}
