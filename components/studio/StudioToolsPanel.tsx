"use client";

import { memo, useState } from "react";
import {
  Award,
  Briefcase,
  FileText,
  GraduationCap,
  ImageIcon,
  Languages,
  LayoutGrid,
  LayoutTemplate,
  Minus,
  Palette,
  Share2,
  Type,
  Upload,
  User,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor-store";
import { useDesignStore } from "@/lib/design-store";
import { EDITOR_TEMPLATES } from "@/lib/cv-editor/template-catalog";
import { CvTemplateThumbnail } from "@/components/templates/CvTemplateThumbnail";
import { StudioImageControls } from "@/components/studio/StudioImageControls";
import { StudioSectionOrder } from "@/components/studio/StudioSectionOrder";
import { StudioSectionStylePanel } from "@/components/studio/StudioSectionStylePanel";
import { StudioTypographyPanel } from "@/components/studio/StudioTypographyPanel";
import { StudioColorsPanel } from "@/components/studio/StudioColorsPanel";
import { cn } from "@/lib/utils";

type ContentBlock = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

const CONTENT_BLOCKS: ContentBlock[] = [
  { id: "text", label: "Text", icon: Type, description: "Free-form text block" },
  { id: "divider", label: "Divider", icon: Minus, description: "Horizontal line" },
  { id: "skills", label: "Skills", icon: LayoutGrid, description: "Skills list" },
  { id: "experience", label: "Experience", icon: Briefcase, description: "Work history" },
  { id: "education", label: "Education", icon: GraduationCap, description: "Degrees & schools" },
  { id: "languages", label: "Languages", icon: Languages, description: "Language proficiency" },
  { id: "references", label: "References", icon: User, description: "Professional references" },
  { id: "timeline", label: "Timeline", icon: FileText, description: "Chronological events" },
  { id: "certificates", label: "Certificates", icon: Award, description: "Certifications" },
  { id: "social", label: "Social Links", icon: Share2, description: "LinkedIn, GitHub, etc." },
  { id: "photo", label: "Profile Photo", icon: ImageIcon, description: "Avatar image" },
];

export type StudioTool =
  | "content"
  | "templates"
  | "typography"
  | "colors"
  | "layout"
  | "uploads";

const TOOLS: {
  id: StudioTool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "content", label: "Content", icon: FileText },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "typography", label: "Typography", icon: Type },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "uploads", label: "Uploads", icon: Upload },
];

interface StudioToolsPanelProps {
  cvId?: string | null;
  onSave: () => void;
  onExportPdf: () => void;
  onExportPng?: () => void;
  onSelectTemplate?: (slug: string) => void;
  saving?: boolean;
}

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
      {children}
    </p>
  );
}

function StudioToolsPanelInner({
  cvId,
  onSelectTemplate,
}: StudioToolsPanelProps) {
  const [tool, setTool] = useState<StudioTool>("content");
  const addTextElement = useEditorStore((s) => s.addTextElement);
  const addSectionBlock = useEditorStore((s) => s.addSectionBlock);
  const addDividerElement = useEditorStore((s) => s.addDividerElement);
  const addImageElement = useEditorStore((s) => s.addImageElement);
  const applyThemeToCanvas = useDesignStore((s) => s.applyThemeToCanvas);
  const setSpacing = useDesignStore((s) => s.setSpacing);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const selectedTemplate = useDesignStore((s) => s.selectedTemplate);
  const toggleRulers = useEditorStore((s) => s.toggleRulers);
  const showRulers = useEditorStore((s) => s.showRulers);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);

  const handleAddBlock = (blockId: string) => {
    switch (blockId) {
      case "text":
        addTextElement();
        break;
      case "divider":
        addDividerElement();
        break;
      case "skills":
        addSectionBlock("skills", "JavaScript • React • Node.js\nTypeScript • PostgreSQL");
        break;
      case "experience":
        addSectionBlock(
          "experience",
          "Senior Developer — Company Name\n2022 – Present\n• Led product delivery and team mentoring"
        );
        break;
      case "education":
        addSectionBlock("education", "Bachelor of Science — University\n2018 – 2022");
        break;
      case "languages":
        addSectionBlock("languages", "English — Fluent\nAzerbaijani — Native");
        break;
      case "references":
        addSectionBlock(
          "summary",
          "References available upon request.\n\nName — Title, Company\nEmail • Phone"
        );
        break;
      case "timeline":
        addSectionBlock(
          "experience",
          "2024 — Senior Role\n2022 — Mid-level Role\n2020 — Junior Role"
        );
        break;
      case "certificates":
        addSectionBlock("projects", "AWS Certified Developer — 2024\nGoogle UX Design — 2023");
        break;
      case "social":
        addTextElement();
        break;
      case "photo":
        addImageElement();
        break;
      default:
        break;
    }
  };

  return (
    <aside className="flex h-full shrink-0 border-r border-zinc-200 bg-white">
      <nav
        className="flex w-[52px] shrink-0 flex-col items-center gap-1 border-r border-zinc-100 py-3"
        aria-label="Studio tools"
      >
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => setTool(t.id)}
            className={cn(
              "flex w-10 flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-medium transition",
              tool === t.id
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
            )}
          >
            <t.icon className="h-[18px] w-[18px]" />
            <span className="max-w-[44px] truncate leading-none">{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex w-[248px] flex-col">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">
            {TOOLS.find((t) => t.id === tool)?.label}
          </h2>
          {tool === "templates" && (
            <p className="mt-0.5 text-xs text-zinc-400">Content is preserved when switching</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tool === "content" && (
            <div className="space-y-4">
              <PanelHeading>Add blocks</PanelHeading>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_BLOCKS.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => handleAddBlock(block.id)}
                    className="group flex flex-col items-start gap-2 rounded-xl border border-zinc-200 p-3 text-left transition hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition group-hover:bg-zinc-900 group-hover:text-white">
                      <block.icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold text-zinc-800">{block.label}</span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-zinc-400">
                        {block.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool === "templates" && (
            <div className="space-y-3">
              <PanelHeading>Switch template</PanelHeading>
              <div className="grid grid-cols-2 gap-2">
                {EDITOR_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => onSelectTemplate?.(tpl.slug)}
                    className={cn(
                      "overflow-hidden rounded-xl border bg-white text-left transition hover:scale-[1.02] hover:shadow-md",
                      selectedTemplate?.slug === tpl.slug
                        ? "border-zinc-900 ring-1 ring-zinc-900"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <CvTemplateThumbnail template={tpl} className="rounded-none" />
                    <p className="truncate px-2 py-1.5 text-[10px] font-medium text-zinc-700">
                      {tpl.name}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400">
                Your content is preserved when switching templates.
              </p>
            </div>
          )}

          {tool === "typography" && <StudioTypographyPanel />}

          {tool === "colors" && <StudioColorsPanel />}

          {tool === "layout" && (
            <div className="space-y-4">
              <PanelHeading>Section styles</PanelHeading>
              <StudioSectionStylePanel />
              <PanelHeading>Section order</PanelHeading>
              <StudioSectionOrder />
              <PanelHeading>Guides & snap</PanelHeading>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleRulers}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium",
                    showRulers
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 hover:bg-zinc-50"
                  )}
                >
                  Rulers
                </button>
                <button
                  type="button"
                  onClick={toggleSnap}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium",
                    snapEnabled
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 hover:bg-zinc-50"
                  )}
                >
                  Snap to grid
                </button>
              </div>
              <PanelHeading>Section spacing</PanelHeading>
              <label className="block text-xs text-zinc-600">
                <input
                  type="range"
                  min={8}
                  max={32}
                  step={2}
                  value={activeTheme.spacing}
                  onChange={(e) => setSpacing(Number(e.target.value))}
                  className="mt-2 w-full accent-zinc-900"
                />
                <span className="mt-1 block text-zinc-400">{activeTheme.spacing}px</span>
              </label>
              <button
                type="button"
                onClick={applyThemeToCanvas}
                className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white"
              >
                Apply layout
              </button>
            </div>
          )}

          {tool === "uploads" && (
            <StudioImageControls cvId={cvId} compact />
          )}
        </div>
      </div>
    </aside>
  );
}

export const StudioToolsPanel = memo(StudioToolsPanelInner);
