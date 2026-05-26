"use client";

import { memo, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { AestheticStyle, LayoutType, TemplateFilters } from "@/types/design-system";
import { cn } from "@/lib/utils";

const AESTHETICS: AestheticStyle[] = [
  "minimal",
  "startup",
  "luxury",
  "cyber",
  "glass",
  "faang",
  "brutalist",
  "portfolio",
];

const LAYOUTS: LayoutType[] = ["single-column", "two-column", "sidebar", "card-grid"];

interface TemplateFilterBarProps {
  filters: TemplateFilters;
  onChange: (filters: TemplateFilters) => void;
  resultCount: number;
}

function TemplateFilterBarInner({ filters, onChange, resultCount }: TemplateFilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.query) n++;
    if (filters.aesthetic?.length) n++;
    if (filters.layout?.length) n++;
    if (filters.mode) n++;
    if (filters.minAts != null) n++;
    if (filters.minModernity != null) n++;
    return n;
  }, [filters]);

  const toggleAesthetic = (a: AestheticStyle) => {
    const current = filters.aesthetic ?? [];
    const next = current.includes(a) ? current.filter((x) => x !== a) : [...current, a];
    onChange({ ...filters, aesthetic: next.length ? next : undefined });
  };

  const toggleLayout = (l: LayoutType) => {
    const current = filters.layout ?? [];
    const next = current.includes(l) ? current.filter((x) => x !== l) : [...current, l];
    onChange({ ...filters, layout: next.length ? next : undefined });
  };

  const clearAll = () => onChange({});

  return (
    <div className="os-glass rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Search templates, industries, styles…"
            value={filters.query ?? ""}
            onChange={(e) => onChange({ ...filters, query: e.target.value || undefined })}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
            expanded
              ? "border-violet-500/50 bg-violet-500/10 text-violet-200"
              : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-violet-500 px-1.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}

        <span className="text-xs text-zinc-500">{resultCount} templates</span>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Aesthetic
            </p>
            <div className="flex flex-wrap gap-2">
              {AESTHETICS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAesthetic(a)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs capitalize transition",
                    filters.aesthetic?.includes(a)
                      ? "bg-violet-600 text-white"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Layout
            </p>
            <div className="flex flex-wrap gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLayout(l)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs transition",
                    filters.layout?.includes(l)
                      ? "bg-violet-600 text-white"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  )}
                >
                  {l.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs text-zinc-400">
              Mode
              <select
                value={filters.mode ?? ""}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    mode: (e.target.value as TemplateFilters["mode"]) || undefined,
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200"
              >
                <option value="">Any</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>

            <label className="text-xs text-zinc-400">
              Min ATS
              <input
                type="range"
                min={60}
                max={98}
                value={filters.minAts ?? 60}
                onChange={(e) =>
                  onChange({ ...filters, minAts: Number(e.target.value) })
                }
                className="mt-2 w-full accent-violet-500"
              />
              <span className="text-zinc-300">{filters.minAts ?? 60}+</span>
            </label>

            <label className="text-xs text-zinc-400">
              Min modernity
              <input
                type="range"
                min={40}
                max={100}
                value={filters.minModernity ?? 40}
                onChange={(e) =>
                  onChange({ ...filters, minModernity: Number(e.target.value) })
                }
                className="mt-2 w-full accent-violet-500"
              />
              <span className="text-zinc-300">{filters.minModernity ?? 40}+</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export const TemplateFilterBar = memo(TemplateFilterBarInner);
