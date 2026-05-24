/**
 * Programmatic CV sample catalog — 1000+ templates with CVV-style metadata.
 * Used by /api/templates and the generator template picker.
 */

export interface CVSample {
  id: number;
  slug: string;
  title: string;
  category: string;
  style: string;
  color: string;
  colors: string[];
  description: string;
  tag: string;
  features: string[];
  imageUrl: string;
  views: number;
  downloads: number;
  rating: number;
  atsReady: boolean;
}

export const CV_SAMPLE_CATEGORIES = [
  "Professional",
  "Creative",
  "Tech",
  "Academic",
  "Healthcare",
  "Finance",
  "Legal",
  "Startup",
  "International",
  "Sales",
  "HR",
  "Entry Level",
  "Career Change",
  "Engineering",
] as const;

const ROLES = [
  "Software Engineer",
  "Product Manager",
  "Data Analyst",
  "Marketing Specialist",
  "UX Designer",
  "Project Manager",
  "Business Analyst",
  "DevOps Engineer",
  "Accountant",
  "Sales Executive",
  "HR Manager",
  "Legal Counsel",
  "Nurse Practitioner",
  "Research Scientist",
  "Financial Advisor",
  "Customer Success",
  "Operations Lead",
  "Content Strategist",
  "Full Stack Developer",
  "Executive Assistant",
];

const STYLES = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "executive", label: "Executive" },
] as const;

const PALETTES: Record<string, string[]> = {
  classic: ["#111827", "#1e3a8a", "#000000", "#374151"],
  modern: ["#0f172a", "#0d9488", "#2563eb", "#7c3aed"],
  minimal: ["#18181b", "#52525b", "#0891b2", "#059669"],
  bold: ["#be123c", "#c2410c", "#7e22ce", "#0e7490"],
  executive: ["#1c1917", "#44403c", "#1e40af", "#065f46"],
};

const TAGS = ["Ən Çox Seçilən", "Populyar", "Yeni", "ATS-Ready", "Premium"];

const FEATURES_POOL = [
  "ATS-friendly",
  "Single column",
  "Two column",
  "Skills highlight",
  "Photo optional",
  "QR ready",
  "Multilingual",
  "Print optimized",
];

function seededStat(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
}

function slugify(parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildCatalog(): CVSample[] {
  const samples: CVSample[] = [];
  let id = 1;

  for (const category of CV_SAMPLE_CATEGORIES) {
    for (const role of ROLES) {
      for (const style of STYLES) {
        const colors = PALETTES[style.id] ?? PALETTES.classic;
        const color = colors[0];
        const seed = id;
        const tag = TAGS[seed % TAGS.length];
        const rating = Number((4.5 + (seed % 5) * 0.1).toFixed(1));
        const views = seededStat(seed, 120, 4200);
        const downloads = seededStat(seed + 7, 40, Math.floor(views * 0.45));
        const features = [
          FEATURES_POOL[seed % FEATURES_POOL.length],
          FEATURES_POOL[(seed + 2) % FEATURES_POOL.length],
          "ATS-Ready",
        ];

        samples.push({
          id,
          slug: slugify([category, role, style.id]),
          title: `${role} — ${style.label}`,
          category,
          style: style.id,
          color,
          colors,
          description: `${category} sahəsi üçün ${style.label.toLowerCase()} dizayn. ATS sistemləri və HR mütəxəssisləri tərəfindən təsdiqlənmiş struktur.`,
          tag,
          features: [...new Set(features)],
          imageUrl: `https://placehold.co/400x520/${color.replace("#", "")}/ffffff?text=${encodeURIComponent(style.label)}`,
          views,
          downloads,
          rating,
          atsReady: true,
        });
        id += 1;
      }
    }
  }

  return samples;
}

export const CV_SAMPLES: CVSample[] = buildCatalog();
export const CV_SAMPLE_TOTAL = CV_SAMPLES.length;

export interface CVSampleQuery {
  category?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
}

export interface CVSamplePage {
  templates: CVSample[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function queryCVSamples({
  category,
  search,
  page = 1,
  limit = 24,
}: CVSampleQuery): CVSamplePage {
  let filtered = CV_SAMPLES;

  if (category && category !== "All") {
    filtered = filtered.filter((t) => t.category === category);
  }

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.features.some((f) => f.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    templates: filtered.slice(start, start + limit),
    total,
    page: safePage,
    limit,
    totalPages,
  };
}

export function getCVSampleById(id: number): CVSample | undefined {
  return CV_SAMPLES.find((s) => s.id === id);
}

export function getFeaturedCVSamples(count = 12): CVSample[] {
  return CV_SAMPLES.filter((_, i) => i % 117 === 0).slice(0, count);
}
