"use client";

import { memo } from "react";
import { TextElement } from "./TextElement";
import { SectionBlock } from "./SectionBlock";
import { ShapeElement } from "./ShapeElement";
import { ImageElement } from "./ImageElement";
import { DividerElement } from "./DividerElement";
import type { EditorElement } from "@/types/cv-document";

type Props = {
  elements: EditorElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function renderElement(el: EditorElement, isSelected: boolean, onSelect: (id: string) => void) {
  switch (el.type) {
    case "section":
      return (
        <SectionBlock key={el.id} element={el} isSelected={isSelected} onSelect={onSelect} />
      );
    case "shape":
      return (
        <ShapeElement key={el.id} element={el} isSelected={isSelected} onSelect={onSelect} />
      );
    case "image":
      return (
        <ImageElement key={el.id} element={el} isSelected={isSelected} onSelect={onSelect} />
      );
    case "divider":
      return (
        <DividerElement key={el.id} element={el} isSelected={isSelected} onSelect={onSelect} />
      );
    default:
      return (
        <TextElement key={el.id} element={el} isSelected={isSelected} onSelect={onSelect} />
      );
  }
}

function ElementLayerInner({ elements, selectedId, onSelect }: Props) {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  return <>{sorted.map((el) => renderElement(el, selectedId === el.id, onSelect))}</>;
}

export const ElementLayer = memo(ElementLayerInner);
