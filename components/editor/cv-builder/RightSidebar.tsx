"use client";

import { memo, useMemo } from "react";
import type { CvEditorElement } from "@/types/cv-editor";
import { useCvEditorStore } from "@/store/cv-editor-store";

const FONT_FAMILIES = ["Inter", "Georgia", "Arial", "Helvetica", "Times New Roman"];

function RightSidebarInner() {
  const selectedId = useCvEditorStore((s) => s.selectedId);
  const elements = useCvEditorStore((s) => s.elements);
  const updateElement = useCvEditorStore((s) => s.updateElement);

  const selected = useMemo(
    () => elements.find((e) => e.id === selectedId) ?? null,
    [elements, selectedId]
  );

  const patchStyle = (patch: Partial<CvEditorElement["style"]>) => {
    if (!selected) return;
    updateElement(selected.id, { style: patch });
  };

  if (!selected) {
    return (
      <aside className="flex w-72 shrink-0 flex-col border-l border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Properties
          </p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-medium text-zinc-700">No selection</p>
          <p className="mt-1 text-xs text-zinc-500">
            Click an element on the canvas to edit its properties.
          </p>
        </div>
      </aside>
    );
  }

  const s = selected.style;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Properties
        </p>
        <p className="mt-1 truncate text-sm font-medium capitalize text-zinc-800">
          {selected.type}
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {selected.type !== "image" && (
          <>
            <Field label="Font size">
              <input
                type="number"
                min={8}
                max={96}
                value={s.fontSize ?? 14}
                onChange={(e) => patchStyle({ fontSize: Number(e.target.value) })}
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
              />
            </Field>

            <Field label="Font family">
              <select
                value={s.fontFamily ?? "Inter"}
                onChange={(e) => patchStyle({ fontFamily: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Line height">
              <input
                type="number"
                min={1}
                max={3}
                step={0.1}
                value={s.lineHeight ?? 1.4}
                onChange={(e) => patchStyle({ lineHeight: Number(e.target.value) })}
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
              />
            </Field>

            <Field label="Letter spacing">
              <input
                type="number"
                min={-2}
                max={10}
                step={0.5}
                value={s.letterSpacing ?? 0}
                onChange={(e) => patchStyle({ letterSpacing: Number(e.target.value) })}
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
              />
            </Field>

            <Field label="Alignment">
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => patchStyle({ textAlign: align })}
                    className={`flex-1 rounded-lg border py-1.5 text-xs capitalize ${
                      s.textAlign === align
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Formatting">
              <div className="flex gap-1">
                <ToggleBtn
                  active={s.fontWeight === "bold" || s.fontWeight === 700}
                  onClick={() =>
                    patchStyle({
                      fontWeight:
                        s.fontWeight === "bold" || s.fontWeight === 700 ? "normal" : "bold",
                    })
                  }
                >
                  B
                </ToggleBtn>
                <ToggleBtn
                  active={s.fontStyle === "italic"}
                  onClick={() =>
                    patchStyle({
                      fontStyle: s.fontStyle === "italic" ? "normal" : "italic",
                    })
                  }
                >
                  I
                </ToggleBtn>
                <ToggleBtn
                  active={s.textDecoration === "underline"}
                  onClick={() =>
                    patchStyle({
                      textDecoration:
                        s.textDecoration === "underline" ? "none" : "underline",
                    })
                  }
                >
                  U
                </ToggleBtn>
              </div>
            </Field>
          </>
        )}

        <Field label="Color">
          <input
            type="color"
            value={s.color ?? "#18181b"}
            onChange={(e) => patchStyle({ color: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-lg border border-zinc-200"
          />
        </Field>

        <Field label="Background">
          <input
            type="color"
            value={s.background?.startsWith("#") ? s.background : "#ffffff"}
            onChange={(e) => patchStyle({ background: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-lg border border-zinc-200"
          />
        </Field>

        <Field label="Padding">
          <input
            type="number"
            min={0}
            max={64}
            value={s.padding ?? 0}
            onChange={(e) => patchStyle({ padding: Number(e.target.value) })}
            className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
          />
        </Field>

        <Field label="Opacity">
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={s.opacity ?? 1}
            onChange={(e) => patchStyle({ opacity: Number(e.target.value) })}
            className="w-full"
          />
        </Field>

        <Field label="Border radius">
          <input
            type="number"
            min={0}
            max={999}
            value={s.borderRadius ?? 0}
            onChange={(e) => patchStyle({ borderRadius: Number(e.target.value) })}
            className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
          />
        </Field>

        <Field label="Shadow">
          <select
            value={s.boxShadow ?? "none"}
            onChange={(e) => patchStyle({ boxShadow: e.target.value })}
            className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
          >
            <option value="none">None</option>
            <option value="0 1px 3px rgba(0,0,0,0.12)">Soft</option>
            <option value="0 4px 12px rgba(0,0,0,0.15)">Medium</option>
            <option value="0 8px 24px rgba(0,0,0,0.2)">Strong</option>
          </select>
        </Field>

        <Field label="Position">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={Math.round(selected.x)}
              onChange={(e) =>
                updateElement(selected.id, { x: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
              aria-label="X"
            />
            <input
              type="number"
              value={Math.round(selected.y)}
              onChange={(e) =>
                updateElement(selected.id, { y: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
              aria-label="Y"
            />
          </div>
        </Field>

        <Field label="Size">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={24}
              value={Math.round(selected.width)}
              onChange={(e) =>
                updateElement(selected.id, { width: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
              aria-label="Width"
            />
            <input
              type="number"
              min={24}
              value={Math.round(selected.height)}
              onChange={(e) =>
                updateElement(selected.id, { height: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
              aria-label="Height"
            />
          </div>
        </Field>
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg border py-1.5 text-xs font-bold ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
      }`}
    >
      {children}
    </button>
  );
}

export const RightSidebar = memo(RightSidebarInner);
