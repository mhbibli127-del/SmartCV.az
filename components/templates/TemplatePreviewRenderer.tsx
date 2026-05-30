"use client";

import { memo } from "react";
import type { CvEditorTemplate } from "@/types/cv-editor";
import type { TemplateSlug } from "@/templates/registry";
import { isKnownTemplateSlug } from "@/templates/registry";

interface PreviewProps {
  template: CvEditorTemplate;
  className?: string;
}

function MinimalCorporatePreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div className="flex h-full flex-col bg-white p-[10%]">
      <div className="text-[9px] font-bold text-zinc-900">Your Name</div>
      <div className="mt-0.5 text-[6px] text-zinc-500">Professional Title</div>
      <div className="my-2 h-px w-full bg-zinc-300" />
      <div className="text-[5px] text-zinc-400">email@example.com</div>
      <div className="mt-3 text-[5px] font-bold tracking-widest text-zinc-800">SUMMARY</div>
      <div className="mt-1 space-y-0.5">
        {[90, 85, 70].map((w) => (
          <div key={w} className="h-[2px] rounded-full bg-zinc-300" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="mt-3 text-[5px] font-bold tracking-widest text-zinc-800">EXPERIENCE</div>
      <div className="mt-1 space-y-1">
        <div className="h-[2px] w-[60%] rounded-full" style={{ background: colors.text, opacity: 0.4 }} />
        <div className="h-[2px] w-[80%] rounded-full bg-zinc-200" />
      </div>
    </div>
  );
}

function ModernSplitPreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div className="relative flex h-full">
      <div className="w-[34%] p-[8%]" style={{ background: colors.primary }}>
        <div
          className="mx-auto mb-2 h-[18%] w-[18%] rounded-full"
          style={{ background: colors.accent, opacity: 0.5 }}
        />
        <div className="text-center text-[6px] font-bold text-white">Name</div>
        <div className="mt-2 text-[4px] leading-relaxed text-white/80">Skills<br />Leadership<br />Strategy</div>
      </div>
      <div className="flex-1 p-[8%]">
        <div className="text-[6px] font-bold" style={{ color: colors.primary }}>About</div>
        <div className="mt-1 space-y-0.5">
          <div className="h-[2px] w-full rounded-full bg-zinc-200" />
          <div className="h-[2px] w-[85%] rounded-full bg-zinc-200" />
        </div>
        <div className="mt-2 text-[6px] font-bold" style={{ color: colors.primary }}>Experience</div>
        <div className="mt-0.5 h-[2px] w-[20%] rounded-full" style={{ background: colors.accent }} />
        <div className="mt-1 h-[2px] w-[90%] rounded-full bg-zinc-200" />
      </div>
    </div>
  );
}

function ExecutiveDarkPreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div className="flex h-full flex-col items-center p-[10%]" style={{ background: colors.background }}>
      <div className="h-[2px] w-full" style={{ background: colors.accent }} />
      <div className="mt-3 text-center text-[8px] tracking-[0.2em] text-white">YOUR NAME</div>
      <div className="mt-1 text-[5px] tracking-widest" style={{ color: colors.accent }}>Executive Title</div>
      <div className="my-2 h-px w-[30%]" style={{ background: colors.accent, opacity: 0.6 }} />
      <div
        className="mt-2 w-full rounded-none p-2 text-center text-[4px] italic text-zinc-300"
        style={{ border: `1px solid ${colors.accent}40`, background: `${colors.accent}10` }}
      >
        Luxury summary text block
      </div>
      <div className="mt-3 text-[4px] tracking-[0.15em]" style={{ color: colors.accent }}>EXPERIENCE</div>
    </div>
  );
}

function CreativePortfolioPreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div className="relative h-full p-[6%]" style={{ background: colors.background }}>
      <div
        className="absolute right-[6%] top-[6%] h-[28%] w-[55%] rounded-xl"
        style={{ background: colors.primary }}
      />
      <div
        className="absolute left-[6%] top-[14%] h-[16%] w-[16%] rounded-lg shadow-md"
        style={{ background: colors.accent }}
      />
      <div className="absolute right-[10%] top-[10%] text-[7px] font-extrabold text-white">Name</div>
      <div
        className="absolute left-[6%] top-[36%] h-[18%] w-[42%] rounded-xl"
        style={{ background: "#fef3c7" }}
      />
      <div
        className="absolute right-[6%] top-[36%] h-[18%] w-[42%] rounded-xl opacity-30"
        style={{ background: colors.primary }}
      />
      <div
        className="absolute bottom-[8%] left-[6%] right-[6%] h-[28%] border-[2px] border-zinc-900 bg-white"
        style={{ borderColor: colors.primary }}
      />
    </div>
  );
}

function BrutalistBoldPreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div className="h-full p-[6%]">
      <div className="flex h-full flex-col border-[3px] border-black p-[8%]">
        <div className="text-[11px] font-black leading-none text-black">NAME</div>
        <div className="mt-1 w-[50%] bg-black px-1 py-0.5 text-[4px] font-bold text-white">TITLE</div>
        <div className="my-2 h-[3px] w-full" style={{ background: colors.accent }} />
        <div className="text-[5px] font-black">01 / ABOUT</div>
        <div className="mt-1 h-[2px] w-full bg-zinc-300" />
        <div className="mt-2 text-[5px] font-black">02 / EXPERIENCE</div>
        <div className="mt-1 flex-1 border-[2px] border-black p-1">
          <div className="h-[2px] w-[80%] bg-zinc-400" />
        </div>
      </div>
    </div>
  );
}

function TimelinePreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div className="h-full p-[8%]">
      <div className="text-[8px] font-bold" style={{ color: colors.primary }}>Your Name</div>
      <div className="mt-0.5 text-[5px]" style={{ color: colors.accent }}>Title</div>
      <div className="relative mt-4 pl-[22%]">
        <div
          className="absolute bottom-0 left-[18%] top-0 w-[2px] rounded-full opacity-50"
          style={{ background: colors.accent }}
        />
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative mb-2">
            <div
              className="absolute -left-[6%] top-0 h-[6px] w-[6px] rounded-full"
              style={{ background: i === 0 ? colors.primary : colors.accent }}
            />
            <div className="absolute -left-[20%] top-0 text-[4px] font-bold" style={{ color: colors.primary }}>
              20{i + 1}
            </div>
            <div className="h-[2px] w-[85%] rounded-full bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AppleMinimalPreview({ template }: PreviewProps) {
  return (
    <div className="flex h-full flex-col bg-white px-[12%] pt-[18%]">
      <div className="text-[10px] font-semibold tracking-tight text-zinc-900">Your Name</div>
      <div className="mt-1 text-[6px] font-light text-zinc-400">Professional Title</div>
      <div className="mt-4 h-px w-[8%] bg-zinc-300" />
      <div className="mt-6 space-y-1">
        <div className="h-[2px] w-[65%] rounded-full bg-zinc-200" />
        <div className="h-[2px] w-[55%] rounded-full bg-zinc-200" />
      </div>
      <div className="mt-8 text-[5px] font-medium text-zinc-400">Experience</div>
      <div className="mt-2 space-y-1">
        <div className="h-[2px] w-[70%] rounded-full bg-zinc-200" />
        <div className="h-[2px] w-[60%] rounded-full bg-zinc-100" />
      </div>
    </div>
  );
}

function NeonCyberPreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div
      className="relative h-full overflow-hidden p-[8%]"
      style={{ background: "linear-gradient(160deg, #0f0f23, #1a0a2e)" }}
    >
      <div className="h-[1px] w-full shadow-[0_0_8px_cyan]" style={{ background: colors.accent }} />
      <div className="mt-2 text-[8px] font-bold text-white" style={{ textShadow: `0 0 6px ${colors.accent}` }}>
        Name
      </div>
      <div className="text-[5px]" style={{ color: colors.accent }}>{`// Developer`}</div>
      <div
        className="mt-2 rounded border p-1"
        style={{ borderColor: `${colors.accent}60`, background: "rgba(0,255,255,0.05)" }}
      >
        <div className="h-[2px] w-[80%] rounded-full" style={{ background: colors.accent, opacity: 0.5 }} />
      </div>
      <div
        className="mt-2 rounded border p-1.5"
        style={{ borderColor: `${colors.primary}50`, background: "rgba(0,0,0,0.4)" }}
      >
        <div className="text-[4px] text-zinc-400">[ EXPERIENCE ]</div>
        <div className="mt-1 h-[2px] w-full bg-zinc-700" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: colors.primary, boxShadow: `0 0 8px ${colors.primary}` }} />
    </div>
  );
}

function GlassmorphismPreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div
      className="relative h-full overflow-hidden"
      style={{ background: "linear-gradient(135deg, #667eea, #764ba2, #f093fb)" }}
    >
      <div className="absolute -left-4 top-4 h-12 w-12 rounded-full opacity-40" style={{ background: colors.primary }} />
      <div className="absolute bottom-8 right-0 h-16 w-16 rounded-full opacity-30" style={{ background: colors.accent }} />
      <div className="absolute inset-x-[8%] top-[8%] h-[22%] rounded-xl border border-white/40 bg-white/25 backdrop-blur-sm" />
      <div className="absolute left-[8%] top-[36%] h-[18%] w-[42%] rounded-lg border border-white/30 bg-white/20" />
      <div className="absolute right-[8%] top-[36%] h-[18%] w-[42%] rounded-lg border border-white/30 bg-white/15" />
      <div className="absolute inset-x-[8%] bottom-[8%] h-[28%] rounded-xl border border-white/35 bg-white/22" />
    </div>
  );
}

function MagazinePreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div className="h-full bg-stone-50 p-[8%]">
      <div className="h-[2px] w-full bg-stone-900" />
      <div className="mt-2 font-serif text-[9px] italic text-stone-900">Your Name</div>
      <div className="mt-0.5 text-[4px] uppercase tracking-widest text-stone-500">Professional Title</div>
      <div className="my-2 h-px w-full bg-stone-900" />
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="text-[4px] font-bold tracking-wider text-stone-800">Experience</div>
          <div className="mt-1 space-y-0.5">
            <div className="h-[2px] w-full bg-stone-300" />
            <div className="h-[2px] w-[90%] bg-stone-200" />
          </div>
        </div>
        <div className="w-px bg-stone-300" />
        <div className="flex-1">
          <div className="text-[4px] font-bold tracking-wider text-stone-800">Education</div>
          <div className="mt-1 h-[2px] w-[80%] bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

function CanvaCreativePreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div className="h-full">
      <div className="h-[22%] px-[8%] pt-[6%]" style={{ background: colors.primary }}>
        <div className="text-[7px] font-extrabold text-white">Your Name</div>
        <div className="absolute right-[8%] top-[4%] h-[12%] w-[12%] rounded-full border-2 border-orange-400 bg-white" />
      </div>
      <div className="h-[3%]" style={{ background: colors.accent }} />
      <div className="flex gap-1 p-[6%]">
        <div className="h-[14%] flex-1 rounded-lg bg-pink-400 opacity-80" />
        <div className="h-[14%] flex-1 rounded-lg bg-emerald-400 opacity-80" />
        <div className="h-[14%] flex-1 rounded-lg bg-amber-400 opacity-80" />
      </div>
      <div className="px-[8%]">
        {[100, 120, 140, 110, 130].map((w, i) => (
          <div
            key={i}
            className="mb-1 h-[6px] rounded"
            style={{ width: `${w * 0.35}%`, background: ["#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa"][i] }}
          />
        ))}
      </div>
    </div>
  );
}

function SunsetGradientPreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div className="relative h-full overflow-hidden" style={{ background: colors.background }}>
      <div
        className="h-[32%]"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent}, #845ef7)`,
        }}
      />
      <div className="absolute left-0 right-0 top-[26%] h-[6%] rounded-t-[50%] bg-white" />
      <div
        className="absolute left-[8%] top-[22%] h-[14%] w-[14%] rounded-full border-4 border-white shadow-lg"
        style={{ background: colors.accent, opacity: 0.4 }}
      />
      <div className="absolute left-[28%] top-[20%] text-[8px] font-bold text-white">Your Name</div>
      <div
        className="absolute bottom-[6%] left-[6%] right-[6%] top-[34%] rounded-2xl bg-white shadow-md"
        style={{ boxShadow: `0 8px 24px ${colors.primary}25` }}
      >
        <div
          className="absolute left-[4%] top-[6%] h-[80%] w-[26%] rounded-xl"
          style={{ background: `${colors.primary}14` }}
        />
        <div className="absolute left-[36%] top-[8%] text-[6px] font-bold" style={{ color: colors.text }}>
          About
        </div>
        <div className="absolute left-[36%] top-[18%] h-[2px] w-[12%] rounded-full" style={{ background: colors.primary }} />
        <div className="absolute left-[36%] top-[24%] space-y-1">
          {[90, 75, 85].map((w) => (
            <div key={w} className="h-[2px] rounded-full bg-zinc-200" style={{ width: `${w * 0.35}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SwissInternationalPreview({ template }: PreviewProps) {
  const { colors } = template;
  return (
    <div className="relative flex h-full">
      <div className="w-[5%]" style={{ background: colors.primary }} />
      <div className="relative flex-1 p-[8%]">
        <div
          className="absolute right-[8%] top-[6%] h-[12%] w-[12%]"
          style={{ background: colors.accent }}
        />
        <div className="text-[10px] font-black leading-none" style={{ color: colors.text }}>
          NAME
        </div>
        <div className="mt-1 w-[40%] px-1 py-0.5 text-[4px] font-bold text-white" style={{ background: colors.text }}>
          TITLE
        </div>
        <div className="my-2 h-[2px] w-full" style={{ background: colors.text }} />
        <div className="text-[14px] font-black leading-none" style={{ color: colors.primary }}>
          01
        </div>
        <div className="text-[5px] font-bold tracking-widest" style={{ color: colors.text }}>
          PROFILE
        </div>
        <div className="mt-2 h-[2px] w-full bg-zinc-200" />
        <div className="mt-2 text-[14px] font-black" style={{ color: colors.primary }}>
          02
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-[18%] p-[6%]"
          style={{ background: colors.surface ?? "#f5f5f4" }}
        >
          <div className="absolute bottom-[20%] right-[8%] h-[40%] w-[35%]" style={{ background: colors.accent }} />
        </div>
      </div>
    </div>
  );
}

function ArtDecoLuxePreview({ template }: PreviewProps) {
  const { colors } = template;
  const gold = colors.accent;
  return (
    <div
      className="relative h-full p-[7%]"
      style={{ background: colors.background, color: colors.text }}
    >
      <div className="absolute inset-[5%] border-2" style={{ borderColor: gold }} />
      <div className="absolute inset-[7%] border opacity-50" style={{ borderColor: gold }} />
      <div className="absolute left-[12%] top-[14%] h-[18%] w-[14%] rounded-br-full opacity-20" style={{ background: gold }} />
      <div className="absolute right-[12%] top-[14%] h-[18%] w-[14%] rounded-bl-full opacity-20" style={{ background: gold }} />
      <div className="mx-auto mt-[12%] w-[30%] border-t-2" style={{ borderColor: gold }} />
      <div className="mt-2 text-center text-[9px] tracking-[0.2em]" style={{ color: gold }}>
        YOUR NAME
      </div>
      <div className="mt-1 text-center text-[4px] tracking-[0.3em] opacity-70">EXECUTIVE TITLE</div>
      <div
        className="mx-auto mt-3 h-[12%] w-[12%] rounded-full border-2"
        style={{ borderColor: gold, background: `${gold}30` }}
      />
      <div
        className="mx-auto mt-3 w-[85%] border p-2 text-center text-[4px] italic opacity-80"
        style={{ borderColor: `${gold}50`, background: `${gold}10` }}
      >
        Luxury summary
      </div>
      <div className="absolute bottom-[10%] left-[15%] right-[15%] flex gap-2">
        <div className="h-[2px] flex-1" style={{ background: gold }} />
        <div className="h-[2px] flex-1" style={{ background: gold }} />
      </div>
    </div>
  );
}

function ATSPreview() {
  return (
    <div className="h-full bg-white p-[10%] font-sans">
      <div className="text-[8px] font-bold text-black">Your Name</div>
      <div className="text-[4px] text-zinc-600">email | phone | city</div>
      <div className="mt-1 text-[5px] font-bold text-black">Professional Title</div>
      <div className="mt-3 text-[4px] font-bold text-black">OBJECTIVE</div>
      <div className="mt-0.5 h-[2px] w-full bg-zinc-300" />
      <div className="mt-2 text-[4px] font-bold text-black">WORK EXPERIENCE</div>
      <div className="mt-0.5 h-[2px] w-[90%] bg-zinc-300" />
      <div className="mt-2 text-[4px] font-bold text-black">EDUCATION</div>
      <div className="mt-0.5 h-[2px] w-[70%] bg-zinc-300" />
    </div>
  );
}

const PREVIEW_MAP: Record<TemplateSlug, React.ComponentType<PreviewProps>> = {
  "minimal-corporate": MinimalCorporatePreview,
  "modern-split": ModernSplitPreview,
  "executive-dark": ExecutiveDarkPreview,
  "creative-portfolio": CreativePortfolioPreview,
  "brutalist-bold": BrutalistBoldPreview,
  "timeline-resume": TimelinePreview,
  "apple-minimal": AppleMinimalPreview,
  "neon-cyber": NeonCyberPreview,
  glassmorphism: GlassmorphismPreview,
  "magazine-editorial": MagazinePreview,
  "canva-creative": CanvaCreativePreview,
  "ats-ultra-professional": ATSPreview,
  "sunset-gradient": SunsetGradientPreview,
  "swiss-international": SwissInternationalPreview,
  "art-deco-luxe": ArtDecoLuxePreview,
};

function TemplatePreviewRendererInner({ template, className = "" }: PreviewProps) {
  const slug = isKnownTemplateSlug(template.slug) ? template.slug : "minimal-corporate";
  const Preview = PREVIEW_MAP[slug];

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-lg shadow-inner ${className}`}
      style={{ background: template.colors.background }}
    >
      <Preview template={template} />
    </div>
  );
}

export const TemplatePreviewRenderer = memo(TemplatePreviewRendererInner);
