"use client";

import { memo, useState } from "react";
import {
  Award,
  Briefcase,
  Circle,
  FileText,
  GraduationCap,
  Heart,
  ImageIcon,
  Languages,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Minus,
  Palette,
  Share2,
  Square,
  Star,
  Target,
  Type,
  Upload,
  User,
  Wrench,
  Zap,
  Paintbrush,
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
import { StudioLayersPanel } from "@/components/studio/StudioLayersPanel";
import { StudioAlignControls } from "@/components/studio/StudioAlignControls";
import { StudioBackgroundPanel } from "@/components/studio/StudioBackgroundPanel";
import { StudioQuickToolsPanel } from "@/components/studio/StudioQuickToolsPanel";
import { STUDIO_TEXT_PRESETS } from "@/lib/studio-text-presets";
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
  { id: "summary", label: "Summary", icon: FileText, description: "Professional summary" },
  { id: "projects", label: "Projects", icon: Target, description: "Portfolio projects" },
  { id: "hobbies", label: "Hobbies", icon: Heart, description: "Interests & hobbies" },
  { id: "awards", label: "Awards", icon: Star, description: "Honors & awards" },
  { id: "contact", label: "Contact", icon: Share2, description: "Email, phone, links" },
  { id: "quote", label: "Quote", icon: Zap, description: "Highlight quote" },
];

const QUICK_SHAPES = [
  { id: "shape-rect", label: "Box", icon: Square, shapeType: "rect" as const },
  { id: "shape-circle", label: "Circle", icon: Circle, shapeType: "circle" as const },
  { id: "shape-line", label: "Line", icon: Minus, shapeType: "line" as const },
  { id: "header-band", label: "Header band", icon: LayoutGrid, shapeType: "rect" as const, band: true },
  { id: "footer-band", label: "Footer band", icon: Minus, shapeType: "rect" as const, band: "footer" as const },
  { id: "sidebar-accent", label: "Sidebar", icon: LayoutGrid, shapeType: "rect" as const, band: "sidebar" as const },
  { id: "accent-dot", label: "Accent dot", icon: Circle, shapeType: "circle" as const, band: "dot" as const },
];

export type StudioTool =
  | "content"
  | "shapes"
  | "background"
  | "templates"
  | "typography"
  | "colors"
  | "tools"
  | "layout"
  | "layers"
  | "uploads";

const TOOLS: {
  id: StudioTool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "content", label: "Blocks", icon: FileText },
  { id: "shapes", label: "Shapes", icon: Square },
  { id: "background", label: "Background", icon: Paintbrush },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "typography", label: "Type", icon: Type },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "layers", label: "Layers", icon: Layers },
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
  const addShapeElement = useEditorStore((s) => s.addShapeElement);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const selectedId = useEditorStore((s) => s.selectedId);
  const applyThemeToCanvas = useDesignStore((s) => s.applyThemeToCanvas);
  const setSpacing = useDesignStore((s) => s.setSpacing);
  const activeTheme = useDesignStore((s) => s.activeTheme);
  const selectedTemplate = useDesignStore((s) => s.selectedTemplate);
  const toggleRulers = useEditorStore((s) => s.toggleRulers);
  const showRulers = useEditorStore((s) => s.showRulers);
  const showGrid = useEditorStore((s) => s.showGrid);
  const toggleShowGrid = useEditorStore((s) => s.toggleShowGrid);
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
        addTextElement({
          text: "LinkedIn · GitHub · Portfolio",
          fontSize: 11,
          fill: "#52525b",
        });
        break;
      case "projects":
        addSectionBlock(
          "projects",
          "E-Commerce Platform — Lead Developer\n2023 – Present\n• Scaled checkout to 50k daily users"
        );
        break;
      case "hobbies":
        addSectionBlock("skills", "Photography\nRunning\nOpen Source");
        break;
      case "awards":
        addSectionBlock("projects", "Employee of the Year — 2024\nDean's List — 2020");
        break;
      case "contact":
        addTextElement({
          text: "email@example.com · +994 50 000 00 00 · Baku, AZ",
          fontSize: 11,
        });
        break;
      case "quote":
        addTextElement({
          text: '"Design is not just what it looks like — design is how it works."',
          fontSize: 12,
          fontStyle: "italic",
          lineHeight: 1.5,
          height: 40,
        });
        break;
      case "photo":
        addImageElement();
        break;
      case "summary":
        addSectionBlock(
          "summary",
          "Experienced professional with a track record of delivering results. Skilled in leadership, communication, and cross-functional collaboration."
        );
        break;
      default:
        if (blockId === "header-band") {
          addShapeElement("rect");
          const id = useEditorStore.getState().selectedId;
          if (id) {
            useEditorStore.getState().updateElement(id, {
              x: 0,
              y: 0,
              width: 794,
              height: 48,
              fill: activeTheme.palette.primary,
              opacity: 0.12,
            });
          }
        } else if (blockId === "footer-band") {
          addShapeElement("rect");
          const id = useEditorStore.getState().selectedId;
          if (id) {
            useEditorStore.getState().updateElement(id, {
              x: 0,
              y: 1083,
              width: 794,
              height: 36,
              fill: activeTheme.palette.primary,
              opacity: 0.08,
            });
          }
        } else if (blockId === "sidebar-accent") {
          addShapeElement("rect");
          const id = useEditorStore.getState().selectedId;
          if (id) {
            useEditorStore.getState().updateElement(id, {
              x: 0,
              y: 0,
              width: 220,
              height: 1123,
              fill: activeTheme.palette.primary,
              opacity: 0.06,
            });
          }
        } else if (blockId === "accent-dot") {
          addShapeElement("circle");
          const id = useEditorStore.getState().selectedId;
          if (id) {
            useEditorStore.getState().updateElement(id, {
              x: 48,
              y: 48,
              width: 64,
              height: 64,
              fill: activeTheme.palette.accent,
              opacity: 0.35,
            });
          }
        } else if (blockId.startsWith("shape-")) {
          const shape = QUICK_SHAPES.find((s) => s.id === blockId);
          if (shape) addShapeElement(shape.shapeType);
        }
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

              <PanelHeading>Text presets</PanelHeading>
              <div className="flex flex-wrap gap-1.5">
                {STUDIO_TEXT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.description}
                    onClick={() => addTextElement(preset.patch)}
                    className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[10px] font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

            </div>
          )}

          {tool === "shapes" && (
            <div className="space-y-4">
              <PanelHeading>Shapes & decor</PanelHeading>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => handleAddBlock(shape.id)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 p-3 text-center transition hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    <shape.icon className="h-4 w-4 text-zinc-600" />
                    <span className="text-[10px] font-medium text-zinc-700">{shape.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-400">
                Formalar, xətlər və başlıq zolağı əlavə edin. Rəngi Colors tabından dəyişin.
              </p>
            </div>
          )}

          {tool === "background" && <StudioBackgroundPanel />}

          {tool === "templates" && (
            <div className="space-y-3">
              <PanelHeading>Switch template</PanelHeading>
              <div className="grid grid-cols-2 gap-2">
                {EDITOR_TEMPLATES.map((tpl, index) => (
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
                    <CvTemplateThumbnail
                      template={tpl}
                      className="rounded-none"
                      priority={
                        index < 2 || selectedTemplate?.slug === tpl.slug
                      }
                    />
                    <p className="truncate px-2 py-1.5 text-[10px] font-medium text-zinc-700">
                      {tpl.name}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400">
                Switching templates replaces the canvas with a fresh layout.
              </p>
            </div>
          )}

          {tool === "typography" && <StudioTypographyPanel />}

          {tool === "colors" && <StudioColorsPanel />}

          {tool === "tools" && <StudioQuickToolsPanel />}

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
                  onClick={toggleShowGrid}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium",
                    showGrid
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 hover:bg-zinc-50"
                  )}
                >
                  Grid
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
              <StudioAlignControls compact />
              {selectedId && (
                <>
                  <PanelHeading>Layer order</PanelHeading>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => bringForward(selectedId)}
                      className="flex-1 rounded-lg border border-zinc-200 py-2 text-xs font-medium hover:bg-zinc-50"
                    >
                      Bring forward
                    </button>
                    <button
                      type="button"
                      onClick={() => sendBackward(selectedId)}
                      className="flex-1 rounded-lg border border-zinc-200 py-2 text-xs font-medium hover:bg-zinc-50"
                    >
                      Send back
                    </button>
                  </div>
                </>
              )}
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
              <PanelHeading>Keyboard shortcuts</PanelHeading>
              <ul className="space-y-1 text-[10px] leading-relaxed text-zinc-500">
                <li>Ctrl+Z / Ctrl+Shift+Z — Undo / Redo</li>
                <li>Ctrl+C / Ctrl+V — Copy / Paste element</li>
                <li>Ctrl+D — Duplicate</li>
                <li>Ctrl+G — Toggle snap</li>
                <li>Arrows — Move · [ ] — Layer order</li>
              </ul>
            </div>
          )}

          {tool === "layers" && (
            <div className="space-y-3">
              <PanelHeading>Canvas layers</PanelHeading>
              <StudioLayersPanel />
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
