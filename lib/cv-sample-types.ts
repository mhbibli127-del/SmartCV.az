/**
 * Shared type definitions for CV samples (seed file, generator, repo, UI).
 * A sample is a fully-written CV that users can preview and clone into
 * their own builder via "Use this sample".
 */

export type Seniority = "junior" | "mid" | "senior" | "executive";
export type SampleLanguage = "en" | "az" | "ru";

export interface SampleSections {
  personal: {
    fullName: string;
    title: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string; // "YYYY-MM" or "YYYY"
    endDate: string | "Present";
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  languages?: Array<{ name: string; level: string }>;
  certificates?: Array<{ name: string; issuer: string; year?: string }>;
}

export interface SampleData {
  sections: SampleSections;
}

export interface CVSampleSeed {
  slug: string;
  title: string; // Display title in the gallery (e.g. "Senior Software Engineer — Fintech")
  role: string; // Canonical role name (e.g. "Software Engineer")
  industry: string; // One of the curated industries (see INDUSTRIES below)
  seniority: Seniority;
  language: SampleLanguage;
  summary: string; // Short pitch for the card (1-2 sentences)
  tags?: string[];
  data: SampleData;
}

/** Master list of industries we cover. Keep this stable — the generator,
 *  filters UI, and seed file all reference these strings. */
export const INDUSTRIES = [
  "Software",
  "Data",
  "Product",
  "Design",
  "DevOps",
  "Marketing",
  "Sales",
  "Finance",
  "HR",
  "Operations",
  "Healthcare",
  "Education",
  "Legal",
  "Creative",
  "Skilled Trades",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const SENIORITY_LABELS: Record<Seniority, string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  executive: "Executive",
};

export const LANGUAGE_LABELS: Record<SampleLanguage, string> = {
  en: "English",
  az: "Azərbaycanca",
  ru: "Русский",
};
