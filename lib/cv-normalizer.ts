import type { CVContent, CVSection } from "@/types/cv-document";

function personalFromSections(sections: CVSection[] = []) {
  const personal = sections.find((s) => s.type === "personal");
  const content = (personal?.content ?? {}) as Record<string, string>;
  return {
    fullName: content.name || content.fullName || "",
    title: content.title || "",
    email: content.email || "",
    phone: content.phone || "",
    location: content.location || "",
    website: content.website || content.linkedin || "",
  };
}

/** Normalize builder sections[] or flat generator data for PDF export */
export function normalizeForExport(input: unknown, accentColor = "#18181b") {
  if (!input || typeof input !== "object") {
    return { fullName: "My CV", accentColor };
  }

  const data = input as Record<string, unknown>;

  if (Array.isArray(data.sections)) {
    const sections = data.sections as CVSection[];
    const personal = personalFromSections(sections);
    const summarySec = sections.find((s) => s.type === "summary");
    const expSec = sections.find((s) => s.type === "experience");
    const eduSec = sections.find((s) => s.type === "education");
    const skillsSec = sections.find((s) => s.type === "skills");

    return {
      fullName: personal.fullName || "My CV",
      title: personal.title,
      email: personal.email,
      phone: personal.phone,
      location: personal.location,
      website: personal.website,
      summary: typeof summarySec?.content === "string" ? summarySec.content : "",
      experience: Array.isArray(expSec?.content) ? expSec.content : [],
      education: Array.isArray(eduSec?.content) ? eduSec.content : [],
      skills: Array.isArray(skillsSec?.content)
        ? skillsSec.content
        : typeof skillsSec?.content === "string"
          ? skillsSec.content.split(",").map((s) => s.trim())
          : [],
      accentColor,
    };
  }

  if (data.content && typeof data.content === "object") {
    return normalizeForExport(data.content, accentColor);
  }

  const gen = (data.generatorData ?? data) as Record<string, unknown>;
  return {
    fullName: (gen.fullName as string) || personalFromSections().fullName,
    title: (gen.title as string) || "",
    email: gen.email as string,
    phone: gen.phone as string,
    location: gen.location as string,
    website: gen.website as string,
    summary: gen.summary as string,
    experience: gen.experience,
    education: gen.education,
    skills: gen.skills,
    achievements: gen.achievements,
    accentColor,
  };
}

export function titleFromContent(content: CVContent): string {
  if (content.sections?.length) {
    const personal = content.sections.find((s) => s.type === "personal");
    const c = (personal?.content ?? {}) as Record<string, string>;
    if (c.name) return c.name;
  }
  const gen = content.generatorData as Record<string, string> | undefined;
  if (gen?.fullName) return gen.fullName;
  if (gen?.title) return gen.title;
  if (content.canvas?.elements?.length) {
    const heading = content.canvas.elements.find((e) => e.id === "heading-name");
    if (heading?.text) return heading.text;
  }
  return "Untitled CV";
}

/** Build persisted CV content from API/builder payloads */
export function buildContentFromPayload(cvData: Record<string, unknown>): CVContent {
  const designTheme = cvData.designTheme as CVContent["designTheme"];

  if (cvData.mode === "visual" && cvData.canvas) {
    return {
      mode: "visual",
      canvas: cvData.canvas as CVContent["canvas"],
      sections: Array.isArray(cvData.sections)
        ? (cvData.sections as CVContent["sections"])
        : undefined,
      generatorData: cvData.generatorData as Record<string, unknown> | undefined,
      templateId: cvData.templateId as number | undefined,
      templateName: cvData.templateName as string | undefined,
      designTheme,
      metadata: (cvData.metadata as CVContent["metadata"]) ?? { version: 1 },
    };
  }

  if (Array.isArray(cvData.sections)) {
    return {
      mode: "form",
      sections: cvData.sections as CVContent["sections"],
      templateId: cvData.templateId as number | undefined,
      templateName: cvData.templateName as string | undefined,
      generatorData: cvData.generatorData as Record<string, unknown> | undefined,
      metadata: (cvData.metadata as CVContent["metadata"]) ?? { version: 1 },
    };
  }

  if (cvData.generatorData && typeof cvData.generatorData === "object") {
    return {
      mode: "form",
      generatorData: cvData.generatorData as Record<string, unknown>,
      templateId: cvData.templateId as number | undefined,
      templateName: cvData.templateName as string | undefined,
      metadata: (cvData.metadata as CVContent["metadata"]) ?? { version: 1 },
    };
  }

  return defaultContent();
}

export function defaultContent(): CVContent {
  return {
    mode: "form",
    sections: [
      {
        id: "personal",
        type: "personal",
        title: "Personal Information",
        content: {
          name: "",
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          website: "",
        },
        order: 0,
      },
      {
        id: "summary",
        type: "summary",
        title: "Professional Summary",
        content: "",
        order: 1,
      },
      {
        id: "experience",
        type: "experience",
        title: "Work Experience",
        content: [],
        order: 2,
      },
      {
        id: "education",
        type: "education",
        title: "Education",
        content: [],
        order: 3,
      },
      {
        id: "skills",
        type: "skills",
        title: "Skills",
        content: [],
        order: 4,
      },
    ],
    metadata: { version: 1 },
  };
}
