"use client";

import { useMemo } from "react";
import { MapPin, Briefcase, Star, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CVExampleProfile } from "@/lib/cv-examples/types";
import { cn } from "@/lib/utils";

type Props = {
  example: CVExampleProfile;
  onPreview: (example: CVExampleProfile) => void;
  onUse: (example: CVExampleProfile) => void;
};

export default function ExampleProfileCard({ example, onPreview, onUse }: Props) {
  const initials = example.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const topSkills = useMemo(() => example.skills.slice(0, 3), [example.skills]);

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-[14px] border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
    >
      {/* Mini CV preview — gallery hover zoom */}
      <button
        type="button"
        onClick={() => onPreview(example)}
        className="relative block w-full overflow-hidden bg-zinc-50 p-5 text-left"
      >
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: example.accentColor }}
        />
        <div className="origin-top transition-transform duration-300 group-hover:scale-[1.02]">
          <div className="flex items-start justify-between gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: example.accentColor }}
            >
              {initials}
            </div>
            <Badge variant="secondary" className="shrink-0 text-[10px] font-medium">
              ATS {example.atsScore}%
            </Badge>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-2 w-2/3 rounded bg-zinc-200" />
            <div className="h-1.5 w-1/2 rounded bg-zinc-100" />
            <div className="mt-3 space-y-1.5">
              <div className="h-1 w-full rounded bg-zinc-100" />
              <div className="h-1 w-5/6 rounded bg-zinc-100" />
              <div className="h-1 w-4/6 rounded bg-zinc-100" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {topSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-zinc-500 ring-1 ring-black/[0.06]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </button>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="truncate text-[15px] font-semibold text-zinc-900">{example.name}</h3>
        <p className="truncate text-sm text-zinc-500">{example.role}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{example.location}</span>
        </p>

        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-500">
          {example.summary}
        </p>

        <div className="mt-4 flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {example.experience}
          </span>
          <span className="flex items-center gap-1">
            <Star className={cn("h-3 w-3 fill-amber-400 text-amber-400")} />
            {example.rating}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onPreview(example)}>
            Preview
          </Button>
          <Button size="sm" className="flex-1 gap-1" onClick={() => onUse(example)}>
            <Sparkles className="h-3.5 w-3.5" />
            Use
          </Button>
        </div>
      </div>
    </article>
  );
}
