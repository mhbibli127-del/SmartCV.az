"use client";

import { memo, useMemo } from "react";
import { TextElement } from "./TextElement";
import { SectionBlock } from "./SectionBlock";
import { ShapeElement } from "./ShapeElement";
import { ImageElement } from "./ImageElement";
import { DividerElement } from "./DividerElement";
import type { EditorElement } from "@/types/cv-document";
import { useEditorStore } from "@/lib/editor-store";

type Props = {
  elements: EditorElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disableDrag?: boolean;
};

function renderElement(
  el: EditorElement,
  isSelected: boolean,
  onSelect: (id: string) => void,
  disableDrag?: boolean
) {
  const common = { isSelected, onSelect, disableDrag };
  switch (el.type) {
    case "section":
      return <SectionBlock key={el.id} element={el} {...common} />;
    case "shape":
      return <ShapeElement key={el.id} element={el} {...common} />;
    case "image":
      return <ImageElement key={el.id} element={el} {...common} />;
    case "divider":
      return <DividerElement key={el.id} element={el} {...common} />;
    default:
      return <TextElement key={el.id} element={el} {...common} />;
  }
}

function ElementLayerInner({ elements, selectedId, onSelect, disableDrag }: Props) {
  const activePage = useEditorStore((s) => s.activePage);
  const sorted = useMemo(
    () =>
      [...elements]
        .filter((el) => (el.page ?? 1) === activePage)
        .sort((a, b) => a.zIndex - b.zIndex),
    [elements, activePage]
  );
  return (
    <>
      {sorted.map((el) => renderElement(el, selectedId === el.id, onSelect, disableDrag))}
    </>
  );
}

export const ElementLayer = memo(ElementLayerInner);
