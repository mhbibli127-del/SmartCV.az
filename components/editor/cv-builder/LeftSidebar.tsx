"use client";

import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  ChevronDown,
  GraduationCap,
  Languages,
  LayoutTemplate,
  Palette,
  Paintbrush,
  Type,
  Wrench,
  FolderKanban,
  Award,
} from "lucide-react";
import type { LeftSidebarSection } from "@/types/cv-editor";
import { useCvEditorStore } from "@/store/cv-editor-store";
import { ImageUploadPanel } from "@/components/editor/cv-builder/ImageUploadPanel";
import { TemplateSwitcher } from "@/components/editor/cv-builder/TemplateSwitcher";
import { CvEditorBackgroundPanel } from "@/components/editor/cv-builder/CvEditorBackgroundPanel";
import { cn } from "@/lib/utils";

const SECTIONS: Array<{
  id: LeftSidebarSection;
  label: string;
  icon: typeof Type;
}> = [
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "text", label: "Text", icon: Type },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "fonts", label: "Fonts", icon: Type },
  { id: "layout", label: "Layout", icon: LayoutTemplate },
  { id: "background", label: "Background", icon: Paintbrush },
];

function LeftSidebarInner() {
  const [open, setOpen] = useState<LeftSidebarSection>("text");
  const setActiveSection = useCvEditorStore((s) => s.setActiveSection);
  const addTextElement = useCvEditorStore((s) => s.addTextElement);
  const addSectionBlock = useCvEditorStore((s) => s.addSectionBlock);
  const template = useCvEditorStore((s) => s.template);
  const applyTemplateColors = useCvEditorStore((s) => s.applyTemplateColors);

  const toggle = useCallback(
    (id: LeftSidebarSection) => {
      setOpen(id);
      setActiveSection(id);
    },
    [setActiveSection]
  );

  const handleSectionAction = useCallback(
    (id: LeftSidebarSection) => {
      switch (id) {
        case "text":
          addTextElement();
          break;
        case "experience":
          addSectionBlock("Experience", "Role — Company\nDates\n• Achievement");
          break;
        case "education":
          addSectionBlock("Education", "Degree — University\nYear");
          break;
        case "skills":
          addSectionBlock("Skills", "Skill 1\nSkill 2\nSkill 3");
          break;
        case "languages":
          addSectionBlock("Languages", "English — Fluent\nAzerbaijani — Native");
          break;
        case "projects":
          addSectionBlock("Projects", "Project name\nDescription");
          break;
        case "certificates":
          addSectionBlock("Certificates", "Certificate — Issuer\nYear");
          break;
        case "colors":
          if (template) {
            applyTemplateColors({
              ...template.colors,
              accent: template.colors.primary,
            });
          }
          break;
        default:
          break;
      }
    },
    [addTextElement, addSectionBlock, applyTemplateColors, template]
  );

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Editor</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isOpen = open === id;
          return (
            <div key={id} className="mb-1">
              <button
                type="button"
                onClick={() => toggle(id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isOpen ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-50"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 transition", isOpen && "rotate-180")}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-2 pt-1">
                      {id === "templates" ? (
                        <TemplateSwitcher />
                      ) : id === "background" ? (
                        <CvEditorBackgroundPanel />
                      ) : id === "colors" || id === "fonts" || id === "layout" ? (
                        <button
                          type="button"
                          onClick={() => handleSectionAction(id)}
                          className="w-full rounded-lg bg-zinc-900 py-2 text-xs font-medium text-white hover:bg-zinc-800"
                        >
                          Apply theme defaults
                        </button>
                      ) : id === "text" ? (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleSectionAction(id)}
                            className="w-full rounded-lg border border-zinc-200 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                          >
                            Add text block
                          </button>
                          <ImageUploadPanel />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSectionAction(id)}
                          className="w-full rounded-lg border border-zinc-200 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          Add {label}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export const LeftSidebar = memo(LeftSidebarInner);
