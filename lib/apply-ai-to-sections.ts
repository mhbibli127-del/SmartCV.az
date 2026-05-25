import type { CVSection } from "@/types/cv-document";

/** Map AI enhance/optimize response onto builder section structure */
export function applyAiResultToSections(
  sections: CVSection[],
  aiResult: Record<string, unknown>
): CVSection[] {
  const data = aiResult;

  return sections.map((section) => {
    if (section.type === "personal") {
      const current = (section.content ?? {}) as Record<string, string>;
      const next = { ...current };
      const name = (data.fullName ?? data.name) as string | undefined;
      if (name) next.name = name;
      if (typeof data.email === "string") next.email = data.email;
      if (typeof data.phone === "string") next.phone = data.phone;
      if (typeof data.location === "string") next.location = data.location;
      if (typeof data.title === "string") next.title = data.title;
      if (typeof data.website === "string") next.website = data.website;
      return { ...section, content: next };
    }

    if (section.type === "summary") {
      const summary = (data.summary ?? data.bio ?? data.professionalSummary) as
        | string
        | undefined;
      if (summary) return { ...section, content: summary };
    }

    if (section.type === "experience" && data.experience) {
      return { ...section, content: data.experience };
    }

    if (section.type === "education" && data.education) {
      return { ...section, content: data.education };
    }

    if (section.type === "skills" && data.skills) {
      const skills = Array.isArray(data.skills)
        ? data.skills
        : typeof data.skills === "string"
          ? data.skills.split(",").map((s) => s.trim())
          : section.content;
      return { ...section, content: skills };
    }

    return section;
  });
}
