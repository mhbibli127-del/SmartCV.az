/**
 * Generates distinct A4-ratio SVG preview mockups in public/templates/
 * Run: node scripts/generate-template-previews.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "templates");
fs.mkdirSync(outDir, { recursive: true });

const W = 595;
const H = 842;

const PREVIEWS = [
  {
    slug: "minimal-corporate",
    bg: "#ffffff",
    render: (c) => `
      <rect width="${W}" height="${H}" fill="${c.bg}"/>
      <text x="48" y="72" font-family="Inter,Arial,sans-serif" font-size="28" font-weight="600" fill="#18181b">Sophia Bennett</text>
      <text x="48" y="98" font-family="Inter,Arial,sans-serif" font-size="13" fill="#71717a">Senior Product Designer</text>
      <line x1="48" y1="112" x2="547" y2="112" stroke="#e4e4e7" stroke-width="1"/>
      <text x="48" y="148" font-family="Inter,Arial,sans-serif" font-size="11" font-weight="700" fill="#18181b">EXPERIENCE</text>
      <text x="48" y="172" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="600" fill="#27272a">Google</text>
      <text x="48" y="192" font-family="Inter,Arial,sans-serif" font-size="10" fill="#71717a">Led design system for 30+ products</text>
      <text x="48" y="228" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="600" fill="#27272a">Spotify</text>
      <text x="48" y="248" font-family="Inter,Arial,sans-serif" font-size="10" fill="#71717a">Shipped mobile experiences at scale</text>
    `,
  },
  {
    slug: "modern-split",
    bg: "#ffffff",
    render: () => `
      <rect width="${W}" height="${H}" fill="#ffffff"/>
      <rect x="0" y="0" width="180" height="${H}" fill="#1e3a5f"/>
      <circle cx="90" cy="100" r="42" fill="#38bdf8" opacity="0.35"/>
      <text x="90" y="175" text-anchor="middle" font-family="Inter,sans-serif" font-size="16" font-weight="700" fill="#ffffff">Sophia</text>
      <text x="90" y="198" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#94a3b8">Designer</text>
      <text x="210" y="72" font-family="Inter,sans-serif" font-size="24" font-weight="700" fill="#1e293b">Sophia Bennett</text>
      <text x="210" y="110" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#1e3a5f">EXPERIENCE</text>
      <text x="210" y="138" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#1e293b">Google · Notion</text>
      <text x="210" y="190" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#1e3a5f">SKILLS</text>
      <rect x="210" y="204" width="80" height="8" rx="4" fill="#38bdf8"/>
      <rect x="210" y="222" width="120" height="8" rx="4" fill="#0ea5e9"/>
    `,
  },
  {
    slug: "executive-dark",
    bg: "#0a0a0a",
    render: () => `
      <rect width="${W}" height="${H}" fill="#0a0a0a"/>
      <rect x="0" y="0" width="${W}" height="6" fill="#c9a962"/>
      <text x="48" y="80" font-family="Georgia,serif" font-size="32" fill="#c9a962">Sophia Bennett</text>
      <text x="48" y="112" font-family="Georgia,serif" font-size="13" fill="#a1a1aa">Executive Product Leader</text>
      <line x1="48" y1="130" x2="200" y2="130" stroke="#c9a962" stroke-width="2"/>
      <text x="48" y="170" font-family="Georgia,serif" font-size="11" fill="#c9a962">LEADERSHIP</text>
      <text x="48" y="198" font-family="Georgia,serif" font-size="12" fill="#fafafa">Google · VP Design</text>
      <text x="48" y="240" font-family="Georgia,serif" font-size="12" fill="#fafafa">Stanford University</text>
    `,
  },
  {
    slug: "creative-portfolio",
    bg: "#faf5ff",
    render: () => `
      <rect width="${W}" height="${H}" fill="#faf5ff"/>
      <rect x="48" y="48" width="220" height="120" rx="16" fill="#7c3aed"/>
      <text x="68" y="108" font-family="Inter,sans-serif" font-size="28" font-weight="800" fill="#ffffff">Sophia</text>
      <text x="68" y="138" font-family="Inter,sans-serif" font-size="12" fill="#e9d5ff">Portfolio Designer</text>
      <rect x="290" y="48" width="257" height="60" rx="12" fill="#f59e0b"/>
      <text x="310" y="84" font-family="Inter,sans-serif" font-size="14" font-weight="700" fill="#1e1b4b">Featured Work</text>
      <rect x="48" y="200" width="499" height="100" rx="12" fill="#ffffff" stroke="#e9d5ff"/>
      <text x="68" y="240" font-family="Inter,sans-serif" font-size="13" font-weight="600" fill="#7c3aed">Google · Spotify · Notion</text>
    `,
  },
  {
    slug: "brutalist-bold",
    bg: "#ffffff",
    render: () => `
      <rect width="${W}" height="${H}" fill="#ffffff"/>
      <rect x="32" y="32" width="531" height="80" fill="#000000"/>
      <text x="48" y="86" font-family="Arial Black,sans-serif" font-size="36" font-weight="900" fill="#eab308">SOPHIA</text>
      <rect x="32" y="130" width="8" height="200" fill="#000000"/>
      <text x="56" y="160" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#000">EXPERIENCE</text>
      <text x="56" y="188" font-family="Arial,sans-serif" font-size="12" fill="#404040">GOOGLE / SPOTIFY</text>
      <rect x="32" y="360" width="531" height="4" fill="#eab308"/>
    `,
  },
  {
    slug: "timeline-resume",
    bg: "#ffffff",
    render: () => `
      <rect width="${W}" height="${H}" fill="#ffffff"/>
      <text x="48" y="64" font-family="Inter,sans-serif" font-size="26" font-weight="700" fill="#0f766e">Sophia Bennett</text>
      <line x1="120" y1="100" x2="120" y2="420" stroke="#14b8a6" stroke-width="3"/>
      <circle cx="120" cy="140" r="8" fill="#0f766e"/>
      <text x="148" y="144" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#134e4a">2021 · Google</text>
      <circle cx="120" cy="220" r="8" fill="#14b8a6"/>
      <text x="148" y="224" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#134e4a">2019 · Spotify</text>
      <circle cx="120" cy="300" r="8" fill="#14b8a6"/>
      <text x="148" y="304" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="#134e4a">Stanford University</text>
    `,
  },
  {
    slug: "apple-minimal",
    bg: "#ffffff",
    render: () => `
      <rect width="${W}" height="${H}" fill="#fbfbfd"/>
      <text x="298" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="34" font-weight="600" fill="#1d1d1f">Sophia Bennett</text>
      <text x="298" y="158" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" fill="#86868b">Senior Product Designer</text>
      <text x="80" y="260" font-family="Inter,sans-serif" font-size="11" fill="#86868b">Experience</text>
      <text x="80" y="290" font-family="Inter,sans-serif" font-size="13" fill="#1d1d1f">Google</text>
      <text x="80" y="340" font-family="Inter,sans-serif" font-size="13" fill="#1d1d1f">Notion</text>
    `,
  },
  {
    slug: "neon-cyber",
    bg: "#0f0f23",
    render: () => `
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#a855f7"/>
          <stop offset="100%" stop-color="#22d3ee"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="#0f0f23"/>
      <rect x="40" y="40" width="515" height="760" rx="8" fill="none" stroke="url(#g)" stroke-width="2"/>
      <text x="60" y="90" font-family="Courier New,monospace" font-size="24" fill="#22d3ee">SOPHIA_BENNETT</text>
      <text x="60" y="120" font-family="Courier New,monospace" font-size="11" fill="#a855f7">&gt; product_designer.exe</text>
      <rect x="60" y="150" width="200" height="2" fill="#22d3ee"/>
      <text x="60" y="180" font-family="Courier New,monospace" font-size="10" fill="#e4e4e7">[GOOGLE] [SPOTIFY] [FIGMA]</text>
    `,
  },
  {
    slug: "glassmorphism",
    bg: "#667eea",
    render: () => `
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#667eea"/>
          <stop offset="50%" stop-color="#764ba2"/>
          <stop offset="100%" stop-color="#f093fb"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect x="48" y="60" width="499" height="140" rx="20" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)"/>
      <text x="72" y="120" font-family="Inter,sans-serif" font-size="26" font-weight="700" fill="#1e1b4b">Sophia Bennett</text>
      <rect x="48" y="230" width="240" height="120" rx="16" fill="rgba(255,255,255,0.2)"/>
      <rect x="307" y="230" width="240" height="120" rx="16" fill="rgba(255,255,255,0.2)"/>
    `,
  },
  {
    slug: "magazine-editorial",
    bg: "#fafaf9",
    render: () => `
      <rect width="${W}" height="${H}" fill="#fafaf9"/>
      <text x="48" y="100" font-family="Georgia,serif" font-size="48" font-weight="700" fill="#1c1917">Sophia</text>
      <text x="48" y="130" font-family="Georgia,serif" font-size="48" font-weight="700" fill="#78716c">Bennett</text>
      <line x1="48" y1="150" x2="547" y2="150" stroke="#1c1917" stroke-width="3"/>
      <text x="48" y="190" font-family="Georgia,serif" font-size="11" fill="#78716c">MAGAZINE CV · EDITORIAL</text>
      <text x="48" y="240" font-family="Georgia,serif" font-size="13" fill="#1c1917">Google · Spotify · Stanford</text>
    `,
  },
  {
    slug: "canva-creative",
    bg: "#ffffff",
    render: () => `
      <rect width="${W}" height="${H}" fill="#ffffff"/>
      <rect x="0" y="0" width="${W}" height="100" fill="#2563eb"/>
      <text x="48" y="64" font-family="Inter,sans-serif" font-size="28" font-weight="800" fill="#ffffff">Sophia Bennett</text>
      <rect x="48" y="130" width="120" height="36" rx="18" fill="#f97316"/>
      <text x="68" y="153" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="#fff">Figma</text>
      <rect x="180" y="130" width="120" height="36" rx="18" fill="#2563eb"/>
      <text x="200" y="153" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="#fff">React</text>
    `,
  },
  {
    slug: "ats-ultra-professional",
    bg: "#ffffff",
    render: () => `
      <rect width="${W}" height="${H}" fill="#ffffff"/>
      <text x="48" y="64" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#000">Sophia Bennett</text>
      <text x="48" y="84" font-family="Arial,sans-serif" font-size="11" fill="#555">Senior Product Designer | ATS Optimized</text>
      <text x="48" y="120" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#000">EXPERIENCE</text>
      <text x="48" y="140" font-family="Arial,sans-serif" font-size="10" fill="#222">Google - Senior Product Designer - 2021-Present</text>
      <text x="48" y="158" font-family="Arial,sans-serif" font-size="10" fill="#222">Spotify - Product Designer - 2017-2021</text>
    `,
  },
];

for (const p of PREVIEWS) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
${p.render(p)}
</svg>`;
  fs.writeFileSync(path.join(outDir, `${p.slug}.svg`), svg.trim());
  console.log("Wrote", p.slug + ".svg");
}

console.log(`Done — ${PREVIEWS.length} previews in public/templates/`);
