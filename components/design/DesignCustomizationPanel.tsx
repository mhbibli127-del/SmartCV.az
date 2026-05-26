"use client";

import { memo } from "react";
import {
  Palette,
  Type,
  LayoutGrid,
  Sparkles,
  ChevronDown,
  Wand2,
} from "lucide-react";
import { useDesignStore } from "@/lib/design-store";
import { DESIGN_THEMES, FONT_PAIRINGS, PALETTES } from "@/lib/design-engine/themes";
import { cn } from "@/lib/utils";

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-white/10 pb-4">
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-sm font-medium text-zinc-200">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-violet-400" />
          {title}
        </span>
        <ChevronDown className="h-4 w-4 text-zinc-500 transition group-open:rotate-180" />
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}

function DesignCustomizationPanelInner({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const liveAtsScore = useDesignStore((s) => s.liveAtsScore);
  const setTheme = useDesignStore((s) => s.setTheme);
  const setPaletteAccent = useDesignStore((s) => s.setPaletteAccent);
  const setFontPairing = useDesignStore((s) => s.setFontPairing);
  const setSpacing = useDesignStore((s) => s.setSpacing);
  const applyThemeToCanvas = useDesignStore((s) => s.applyThemeToCanvas);

  const isDark = tone === "dark";

  return (
    <aside
      className={cn(
        "w-72 shrink-0 overflow-y-auto rounded-2xl p-4 text-sm",
        isDark ? "os-glass text-zinc-200" : "os-glass-light text-zinc-800"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-violet-400/80">
            Design OS
          </p>
          <p className={cn("mt-0.5 font-semibold", isDark ? "text-white" : "text-zinc-900")}>
            {activeTheme.name}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          ATS {liveAtsScore}%
        </div>
      </div>

      <Section title="Themes" icon={Wand2}>
        <div className="grid grid-cols-2 gap-2">
          {DESIGN_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme)}
              className={cn(
                "rounded-xl border p-2 text-left transition-all duration-200",
                activeTheme.id === theme.id
                  ? "border-violet-500/60 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              )}
            >
              <div
                className="mb-2 h-8 rounded-lg"
                style={{
                  background: theme.palette.gradient ?? theme.palette.primary,
                }}
              />
              <p className="truncate text-xs font-medium text-zinc-200">{theme.name}</p>
              <p className="text-[10px] text-zinc-500">ATS {theme.atsScore}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Colors" icon={Palette}>
        <div className="flex flex-wrap gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.name}
              onClick={() => setPaletteAccent(p.accent)}
              className="h-8 w-8 rounded-full ring-2 ring-white/10 transition hover:scale-110 hover:ring-violet-500/50"
              style={{ background: p.accent }}
            />
          ))}
        </div>
        <label className="block text-xs text-zinc-400">
          Accent
          <input
            type="color"
            value={activeTheme.palette.accent}
            onChange={(e) => setPaletteAccent(e.target.value)}
            className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
          />
        </label>
      </Section>

      <Section title="Typography" icon={Type}>
        <select
          value={activeTheme.fonts.id}
          onChange={(e) => {
            const pair = FONT_PAIRINGS.find((f) => f.id === e.target.value);
            if (pair) setFontPairing(pair.heading, pair.body);
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          {FONT_PAIRINGS.map((f) => (
            <option key={f.id} value={f.id} className="bg-zinc-900">
              {f.label}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Layout" icon={LayoutGrid}>
        <label className="flex items-center justify-between text-xs text-zinc-400">
          Spacing
          <span className="tabular-nums text-zinc-300">{activeTheme.spacing}px</span>
        </label>
        <input
          type="range"
          min={8}
          max={32}
          step={2}
          value={activeTheme.spacing}
          onChange={(e) => setSpacing(Number(e.target.value))}
          className="w-full accent-violet-500"
        />
        <button
          type="button"
          onClick={applyThemeToCanvas}
          className="w-full rounded-xl bg-violet-600 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
        >
          Apply to canvas
        </button>
      </Section>

      <Section title="Effects" icon={Sparkles} defaultOpen={false}>
        <div className="space-y-2 text-xs text-zinc-400">
          <p>Glass blur: {activeTheme.effects.blur}px</p>
          <p>Shadow: {activeTheme.effects.shadowDepth}</p>
          <p>Animation: {activeTheme.animation}</p>
        </div>
      </Section>
    </aside>
  );
}

export const DesignCustomizationPanel = memo(DesignCustomizationPanelInner);
