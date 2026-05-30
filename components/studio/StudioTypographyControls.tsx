"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, Italic } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/cv-document";

type TextPatch = Partial<
  Pick<
    EditorElement,
    "fontSize" | "fontWeight" | "fontStyle" | "lineHeight" | "letterSpacing" | "textAlign"
  >
>;

interface StudioTypographyControlsProps {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: EditorElement["fontWeight"];
  fontStyle?: EditorElement["fontStyle"];
  textAlign?: EditorElement["textAlign"];
  onChange: (patch: TextPatch) => void;
  compact?: boolean;
}

export function StudioTypographyControls({
  fontSize,
  lineHeight,
  letterSpacing,
  fontWeight,
  fontStyle,
  textAlign = "left",
  onChange,
  compact,
}: StudioTypographyControlsProps) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex flex-wrap gap-1">
        <ToggleBtn
          active={fontWeight === "bold"}
          title="Bold"
          onClick={() =>
            onChange({ fontWeight: fontWeight === "bold" ? "normal" : "bold" })
          }
        >
          <Bold className="h-3.5 w-3.5" />
        </ToggleBtn>
        <ToggleBtn
          active={fontStyle === "italic"}
          title="Italic"
          onClick={() =>
            onChange({ fontStyle: fontStyle === "italic" ? "normal" : "italic" })
          }
        >
          <Italic className="h-3.5 w-3.5" />
        </ToggleBtn>
        <span className="mx-0.5 w-px self-stretch bg-zinc-200" />
        {(
          [
            { align: "left" as const, icon: AlignLeft },
            { align: "center" as const, icon: AlignCenter },
            { align: "right" as const, icon: AlignRight },
          ] as const
        ).map(({ align, icon: Icon }) => (
          <ToggleBtn
            key={align}
            active={textAlign === align}
            title={`Align ${align}`}
            onClick={() => onChange({ textAlign: align })}
          >
            <Icon className="h-3.5 w-3.5" />
          </ToggleBtn>
        ))}
      </div>

      <label className="block text-xs text-zinc-600">
        Font size
        <input
          type="range"
          min={8}
          max={56}
          step={1}
          value={fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          className="mt-2 w-full accent-zinc-900"
        />
        <span className="mt-1 block text-zinc-400">{fontSize}px</span>
      </label>

      {!compact && (
        <>
          <label className="block text-xs text-zinc-600">
            Line height
            <input
              type="range"
              min={1}
              max={2.4}
              step={0.05}
              value={lineHeight}
              onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
              className="mt-2 w-full accent-zinc-900"
            />
            <span className="mt-1 block text-zinc-400">{lineHeight.toFixed(2)}</span>
          </label>

          <label className="block text-xs text-zinc-600">
            Letter spacing
            <input
              type="range"
              min={-1}
              max={4}
              step={0.1}
              value={letterSpacing}
              onChange={(e) => onChange({ letterSpacing: Number(e.target.value) })}
              className="mt-2 w-full accent-zinc-900"
            />
            <span className="mt-1 block text-zinc-400">{letterSpacing.toFixed(1)}px</span>
          </label>
        </>
      )}
    </div>
  );
}

function ToggleBtn({
  children,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-lg border p-2 transition",
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
      )}
    >
      {children}
    </button>
  );
}
