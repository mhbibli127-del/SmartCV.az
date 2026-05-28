"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { EDITOR_TEMPLATES } from "@/lib/cv-editor/template-catalog";
import { TemplateCanvasPreview } from "@/components/preview/TemplateCanvasPreview";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { cn } from "@/lib/utils";

function TemplateSwitcherInner() {
  const current = useCvEditorStore((s) => s.template);
  const switchTemplate = useCvEditorStore((s) => s.switchTemplate);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-zinc-500">
        Switch layout without losing your content. Text fields are preserved.
      </p>
      <div className="grid max-h-[420px] grid-cols-2 gap-2 overflow-y-auto pr-1">
        {EDITOR_TEMPLATES.map((template) => {
          const active = current?.id === template.id;
          return (
            <motion.button
              key={template.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => switchTemplate(template)}
              className={cn(
                "relative overflow-hidden rounded-lg border text-left transition",
                active
                  ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-1"
                  : "border-zinc-200 hover:border-zinc-300"
              )}
            >
              <TemplateCanvasPreview
                template={template}
                className="rounded-none"
                showShadow={false}
              />
              <div className="border-t border-zinc-100 px-2 py-1.5">
                <p className="truncate text-[10px] font-medium text-zinc-800">{template.name}</p>
              </div>
              {active && (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export const TemplateSwitcher = memo(TemplateSwitcherInner);
