"use client";

import { X, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CVExampleProfile } from "@/lib/cv-examples/types";

type Props = {
  example: CVExampleProfile | null;
  onClose: () => void;
  onUse: (example: CVExampleProfile) => void;
};

export default function ExamplePreviewModal({ example, onClose, onUse }: Props) {
  if (!example) return null;

  const cv = example.cvContent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{example.name}</h2>
            <p className="text-sm text-gray-500">
              {example.role} · {example.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Summary
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{cv.summary}</p>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Experience
            </h3>
            {cv.experience.map((exp, i) => (
              <div key={i} className="mt-3 border-l-2 border-gray-200 pl-4">
                <p className="font-semibold text-gray-900">{exp.title}</p>
                <p className="text-sm text-gray-600">
                  {exp.company} · {exp.startDate} – {exp.endDate}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-gray-600">
                  {exp.description.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Skills
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {cv.skills.map((s) => (
                <span key={s} className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1 gap-2" onClick={() => onUse(example)}>
            <Sparkles className="h-4 w-4" />
            Use in Builder
          </Button>
        </div>
      </div>
    </div>
  );
}
