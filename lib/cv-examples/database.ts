/**
 * Realistic CV examples database — hybrid curated + generated profiles.
 * Each entry looks like a real user from a global talent marketplace.
 */
import type { CVExampleProfile, ExampleCategory } from "./types";
import { EXAMPLE_CATEGORIES } from "./types";

const FIRST = [
  "Daniel", "Sarah", "Marcus", "Elena", "James", "Priya", "Oliver", "Yuki",
  "Amir", "Sophie", "Lucas", "Fatima", "Noah", "Isabella", "Ethan", "Aisha",
  "Ryan", "Mia", "Alexander", "Zara", "Benjamin", "Leila", "William", "Chloe",
  "Hassan", "Emma", "David", "Ananya", "Michael", "Laura",
];

const LAST = [
  "Carter", "Mitchell", "Chen", "Rodriguez", "Thompson", "Patel", "Kim",
  "Andersson", "Al-Rashid", "Dubois", "Silva", "Nakamura", "O'Brien", "Khan",
  "Fischer", "Nguyen", "Brooks", "Hassan", "Murphy", "Johansson", "Walsh",
  "Okonkwo", "Petrov", "Santos", "Berg", "Ali", "Morales", "Tanaka", "Reed",
];

const LOCATIONS = [
  "Berlin, Germany", "London, UK", "San Francisco, USA", "Toronto, Canada",
  "Amsterdam, Netherlands", "Singapore", "Sydney, Australia", "Dubai, UAE",
  "Stockholm, Sweden", "Austin, USA", "Paris, France", "Tokyo, Japan",
  "Barcelona, Spain", "New York, USA", "Dublin, Ireland", "Zurich, Switzerland",
  "Baku, Azerbaijan", "Istanbul, Turkey", "Remote — Global",
];

const COMPANIES = [
  "Stripe", "Spotify", "Notion", "Figma", "Shopify", "Revolut", "Canva",
  "Datadog", "MongoDB", "Vercel", "HubSpot", "Atlassian", "Wise", "Klarna",
  "Linear", "Miro", "Deel", "Remote", "GitLab", "Cloudflare",
];

const UNIVERSITIES = [
  "MIT", "Stanford University", "ETH Zürich", "Imperial College London",
  "TU Munich", "University of Toronto", "National University of Singapore",
  "KAIST", "Baku State University", "Boğaziçi University",
];

const TEMPLATES = [
  "canva-modern-pro", "notion-minimal", "executive-serif", "tech-gradient",
  "creative-split", "ats-classic", "startup-bold", "designer-portfolio",
];

const CATEGORY_CONFIG: Record<
  ExampleCategory,
  { roles: string[]; skillPool: string[]; achievementPool: string[] }
> = {
  "Software Engineer": {
    roles: ["Software Engineer", "Senior Software Engineer", "Staff Engineer"],
    skillPool: ["TypeScript", "Python", "Go", "AWS", "Docker", "Kubernetes", "PostgreSQL", "Redis", "System Design"],
    achievementPool: [
      "Reduced API latency by 42% serving 2M+ daily requests",
      "Led migration from monolith to microservices for 15 teams",
      "Shipped CI/CD pipeline cutting deploy time from 45min to 8min",
      "Mentored 6 engineers; 4 promoted within 18 months",
    ],
  },
  "Frontend Developer": {
    roles: ["Frontend Developer", "Senior Frontend Engineer", "UI Engineer"],
    skillPool: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Web Vitals", "GraphQL", "Storybook"],
    achievementPool: [
      "Improved Lighthouse score from 62 to 98 across core product pages",
      "Built design system used by 40+ components across 3 product squads",
      "Cut bundle size by 35% with code-splitting and lazy loading",
      "Launched accessibility program achieving WCAG 2.1 AA compliance",
    ],
  },
  "Backend Developer": {
    roles: ["Backend Developer", "Backend Engineer", "API Architect"],
    skillPool: ["Node.js", "PostgreSQL", "MongoDB", "Redis", "RabbitMQ", "gRPC", "REST", "OAuth 2.0", "Terraform"],
    achievementPool: [
      "Designed event-driven architecture processing 500K events/day",
      "Built billing engine handling $12M ARR with 99.99% uptime",
      "Optimized database queries reducing p99 latency by 60%",
      "Implemented zero-downtime migration for 80M row table",
    ],
  },
  "Full Stack Developer": {
    roles: ["Full Stack Developer", "Full Stack Engineer", "Product Engineer"],
    skillPool: ["React", "Next.js", "Node.js", "TypeScript", "MongoDB", "Prisma", "AWS", "Stripe", "Tailwind"],
    achievementPool: [
      "Built SaaS platform from 0 to 50K users in 14 months",
      "Shipped end-to-end subscription billing with Paddle integration",
      "Owned feature from design to production serving 30K MAU",
      "Reduced customer onboarding time from 2 days to 20 minutes",
    ],
  },
  "UI/UX Designer": {
    roles: ["UI/UX Designer", "Product Designer", "Senior UX Designer"],
    skillPool: ["Figma", "Design Systems", "User Research", "Prototyping", "Wireframing", "Accessibility", "Design Tokens"],
    achievementPool: [
      "Redesigned checkout flow increasing conversion by 28%",
      "Conducted 40+ user interviews informing product roadmap",
      "Created component library adopted by 5 product teams",
      "Won internal design award for mobile onboarding redesign",
    ],
  },
  "Data Analyst": {
    roles: ["Data Analyst", "Senior Data Analyst", "Business Intelligence Analyst"],
    skillPool: ["SQL", "Python", "Tableau", "Power BI", "dbt", "Snowflake", "A/B Testing", "Statistics"],
    achievementPool: [
      "Built executive dashboard tracking $8M pipeline in real time",
      "Identified churn pattern saving $400K annual revenue",
      "Automated weekly reporting saving 15 hours per week",
      "Led pricing experiment yielding 12% ARPU increase",
    ],
  },
  "Product Manager": {
    roles: ["Product Manager", "Senior PM", "Group Product Manager"],
    skillPool: ["Roadmapping", "User Stories", "Agile", "Analytics", "Stakeholder Management", "PRD", "OKRs"],
    achievementPool: [
      "Launched v2 platform driving 35% increase in user retention",
      "Managed $2M product budget across 3 engineering squads",
      "Defined GTM strategy for new market entry in DACH region",
      "Reduced time-to-value from 7 days to 48 hours",
    ],
  },
  "Marketing Specialist": {
    roles: ["Marketing Specialist", "Growth Marketer", "Digital Marketing Manager"],
    skillPool: ["SEO", "Google Ads", "Content Strategy", "HubSpot", "Analytics", "Email Marketing", "Social Media"],
    achievementPool: [
      "Grew organic traffic by 180% in 12 months",
      "Managed $500K ad budget with 3.2x ROAS",
      "Launched referral program generating 2,400 qualified leads",
      "Increased email open rate from 18% to 34%",
    ],
  },
  "Student CV": {
    roles: ["Computer Science Student", "Graduate Student", "Intern — Software"],
    skillPool: ["Java", "Python", "Git", "Algorithms", "Data Structures", "React", "Team Projects"],
    achievementPool: [
      "Dean's List — top 5% of class for 3 consecutive semesters",
      "Built capstone project with 500+ active users on campus",
      "Won university hackathon with AI scheduling assistant",
      "Teaching assistant for Introduction to Programming (120 students)",
    ],
  },
  "Freelancer CV": {
    roles: ["Freelance Developer", "Independent Consultant", "Contract Engineer"],
    skillPool: ["React", "WordPress", "Shopify", "Client Management", "Scoping", "Invoicing", "Remote Work"],
    achievementPool: [
      "Delivered 40+ client projects with 4.9★ average rating",
      "Generated $180K revenue across 18-month freelance career",
      "Retained 70% of clients for repeat engagements",
      "Built custom e-commerce store doing $2M GMV first year",
    ],
  },
  "CEO / Executive CV": {
    roles: ["CEO", "COO", "VP of Engineering", "Managing Director"],
    skillPool: ["Leadership", "P&L Management", "Fundraising", "Board Relations", "Strategy", "M&A", "Scaling Teams"],
    achievementPool: [
      "Scaled company from 12 to 200 employees in 3 years",
      "Raised $18M Series A; led to $45M valuation",
      "Grew ARR from $1.2M to $22M in 24 months",
      "Led acquisition integration of 2 companies within 6 months",
    ],
  },
};

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function pickN<T>(arr: T[], n: number, seed: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    const item = arr[(seed + i * 7) % arr.length];
    if (!out.includes(item)) out.push(item);
  }
  return out;
}

function yearsExp(seed: number): string {
  const y = (seed % 12) + 1;
  return y === 1 ? "1 year" : `${y} years`;
}

function slugify(...parts: string[]): string {
  return parts.join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildExample(index: number, category: ExampleCategory): CVExampleProfile {
  const cfg = CATEGORY_CONFIG[category];
  const first = pick(FIRST, index);
  const last = pick(LAST, index + 3);
  const name = `${first} ${last}`;
  const role = pick(cfg.roles, index);
  const location = pick(LOCATIONS, index + 5);
  const company = pick(COMPANIES, index + 11);
  const university = pick(UNIVERSITIES, index + 7);
  const exp = category === "Student CV" ? "0–1 year" : yearsExp(index);
  const skills = pickN(cfg.skillPool, 6, index);
  const achievements = pickN(cfg.achievementPool, 3, index + 2);
  const template = pick(TEMPLATES, index);
  const accent = pick(["#0f172a", "#2563eb", "#0d9488", "#7c3aed", "#be123c"], index);
  const views = 800 + (index * 137) % 12000;
  const uses = Math.floor(views * (0.08 + (index % 10) * 0.01));
  const rating = Number((4.6 + (index % 4) * 0.1).toFixed(1));
  const atsScore = 88 + (index % 12);
  const slug = slugify(name, role, category);
  const id = `ex-${index + 1}`;

  const summary =
    category === "CEO / Executive CV"
      ? `${role} with ${exp} leading high-growth teams. ${achievements[0]}.`
      : category === "Student CV"
        ? `Motivated ${role.toLowerCase()} with strong foundation in ${skills.slice(0, 3).join(", ")}. ${achievements[0]}.`
        : `${role} based in ${location.split(",")[0]} with ${exp} building production systems. ${achievements[0]}.`;

  const email = `${first.toLowerCase()}.${last.toLowerCase()}@email.com`;

  return {
    id,
    slug,
    name,
    role,
    category,
    location,
    experience: exp,
    skills,
    summary,
    template,
    achievements,
    company,
    education: `${pick(["BSc", "MSc", "MBA"], index)} — ${university}`,
    views,
    uses,
    rating,
    atsScore,
    accentColor: accent,
    cvContent: {
      personal: {
        fullName: name,
        title: role,
        email,
        phone: `+${40 + (index % 50)} ${100 + (index % 900)} ${1000 + (index % 9000)}`,
        location,
        website: index % 3 === 0 ? `https://${first.toLowerCase()}${last.toLowerCase()}.dev` : undefined,
      },
      summary,
      experience: [
        {
          title: role,
          company,
          startDate: `${2024 - parseInt(exp) || 1}`,
          endDate: "Present",
          description: achievements,
        },
        {
          title: `Junior ${role.split(" ").pop()}`,
          company: pick(COMPANIES, index + 19),
          startDate: `${2020 - (index % 3)}`,
          endDate: `${2024 - parseInt(exp) || 1}`,
          description: pickN(cfg.achievementPool, 2, index + 5),
        },
      ],
      education: [
        {
          degree: category === "CEO / Executive CV" ? "MBA" : "BSc Computer Science",
          university,
          graduationYear: String(2018 + (index % 6)),
        },
      ],
      skills,
      achievements,
    },
  };
}

function buildDatabase(): CVExampleProfile[] {
  const examples: CVExampleProfile[] = [];
  let idx = 0;
  for (const category of EXAMPLE_CATEGORIES) {
    for (let i = 0; i < 8; i++) {
      examples.push(buildExample(idx, category));
      idx++;
    }
  }
  return examples;
}

export const CV_EXAMPLES_DATABASE: CVExampleProfile[] = buildDatabase();
export const CV_EXAMPLES_TOTAL = CV_EXAMPLES_DATABASE.length;

export function searchCVExamples(params: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}): {
  examples: CVExampleProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const q = params.q?.trim().toLowerCase() ?? "";
  const category = params.category?.trim();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(48, Math.max(1, params.limit ?? 24));

  let filtered = CV_EXAMPLES_DATABASE;

  if (category && category !== "All") {
    filtered = filtered.filter((e) => e.category === category);
  }

  if (q) {
    filtered = filtered.filter((e) => {
      const haystack = [
        e.name,
        e.role,
        e.category,
        e.location,
        e.company,
        e.summary,
        ...e.skills,
        ...e.achievements,
      ]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((term) => haystack.includes(term));
    });
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const examples = filtered.slice(start, start + limit);

  return { examples, total, page, limit, totalPages };
}

export function getCVExampleBySlug(slug: string): CVExampleProfile | null {
  return CV_EXAMPLES_DATABASE.find((e) => e.slug === slug) ?? null;
}

export function getCVExampleById(id: string): CVExampleProfile | null {
  return CV_EXAMPLES_DATABASE.find((e) => e.id === id) ?? null;
}
