import type {
  ApplySimulation,
  CVData,
  InterviewResult,
  JobMatchResult,
  PortfolioResult,
  SkillGapResult,
} from "@/types/cv";

export const emptyCV: CVData = {
  name: "",
  email: "",
  skills: [],
  experience: [],
  education: [],
};

function safeParseJson<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") {
    try {
      // Handle AI responses that wrap JSON in markdown blocks
      const jsonMatch = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim()) as T;
      }
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  if (typeof value === "object" && value !== null) {
    return value as T;
  }

  return fallback;
}

function normalizeStringArray(value: unknown): string[] {
  if (typeof value === "string") {
    // Handle AI returning comma-separated strings or newline separated text
    return value
      .split(/[,;|\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function normalizeExperience(value: unknown): CVData["experience"] {
  // Handle case where AI returns a single object instead of an array
  const rawList = Array.isArray(value) ? value : value ? [value] : [];
  return rawList
    .map((item): CVData["experience"][0] | null => {
      if (typeof item === "string") {
        return {
          title: item,
          company: "Unknown",
          description: "",
        };
      }
      if (typeof item !== "object" || item === null) return null;
      const raw = item as Record<string, unknown>;
      return {
        title: typeof raw?.title === "string" ? raw.title : "",
        company: typeof raw?.company === "string" ? raw.company : "",
        description: typeof raw?.description === "string" ? raw.description : "",
      };
    })
    .filter((item): item is CVData["experience"][0] => 
      item !== null && (item.title !== "" || item.company !== "" || item.description !== "")
    );
}

function normalizeEducation(value: unknown): CVData["education"] {
  // Handle case where AI returns a single object instead of an array
  const rawList = Array.isArray(value) ? value : value ? [value] : [];
  return rawList
    .map((item): CVData["education"][0] | null => {
      if (typeof item === "string") {
        return {
          degree: item,
          university: "Unknown",
        };
      }
      if (typeof item !== "object" || item === null) return null;
      const raw = item as Record<string, unknown>;
      return {
        degree: typeof raw?.degree === "string" ? raw.degree : "",
        university: typeof raw?.university === "string" ? raw.university : "",
      };
    })
    .filter((item): item is CVData["education"][0] => 
      item !== null && (item.degree !== "" || item.university !== "")
    );
}

export function normalizeCv(rawValue: unknown): CVData {
  const data = safeParseJson(rawValue, {} as Record<string, unknown>);

  return {
    name: typeof data?.name === "string" ? data.name : "",
    email: typeof data?.email === "string" ? data.email : "",
    skills: normalizeStringArray(data?.skills),
    experience: normalizeExperience(data?.experience),
    education: normalizeEducation(data?.education),
  };
}

export function normalizeJobMatch(rawValue: unknown): JobMatchResult {
  const data = safeParseJson(rawValue, {} as Record<string, unknown>);

  return {
    matchScore: typeof data?.matchScore === "number" ? data.matchScore : typeof data?.matchScore === "string" ? Number(data.matchScore) || 0 : 0,
    missingSkills: normalizeStringArray(data?.missingSkills),
    suggestedJobs: normalizeStringArray(data?.suggestedJobs),
  };
}

export function normalizeSkillGap(rawValue: unknown): SkillGapResult {
  const data = safeParseJson(rawValue, {} as Record<string, unknown>);

  return {
    missingSkills: normalizeStringArray(data?.missingSkills),
    roadmap: normalizeStringArray(data?.roadmap),
  };
}

export function normalizeInterview(rawValue: unknown): InterviewResult {
  const data = safeParseJson(rawValue, {} as Record<string, unknown>);
  
  // Robustly handle single question or array of questions
  const rawQuestions = Array.isArray(data?.questions) 
    ? data.questions 
    : data?.questions ? [data.questions] : [];

  const questions = rawQuestions
    .map((question: any) => {
      const raw = question as Record<string, unknown>;
      return {
        question: typeof raw?.question === "string" ? raw.question : "",
        advice: typeof raw?.advice === "string" ? raw.advice : "",
      };
    })
    .filter((item: any) => item.question);

  return {
    questions,
    improvedAnswers: typeof data?.improvedAnswers === "string" ? data.improvedAnswers : "",
  };
}

export function normalizePortfolio(rawValue: unknown): PortfolioResult {
  const data = safeParseJson(rawValue, {} as Record<string, unknown>);

  return {
    websiteOutline: typeof data?.websiteOutline === "string" ? data.websiteOutline : "",
    projectIdeas: normalizeStringArray(data?.projectIdeas),
  };
}

export function normalizeApply(rawValue: unknown): ApplySimulation {
  const data = safeParseJson(rawValue, {} as Record<string, unknown>);

  return {
    coverLetter: typeof data?.coverLetter === "string" ? data.coverLetter : "",
    applicationSummary: typeof data?.applicationSummary === "string" ? data.applicationSummary : "",
  };
}
