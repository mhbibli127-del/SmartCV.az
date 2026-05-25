"use client";

import { memo } from "react";
import { TextElement } from "./TextElement";
import { SectionBlock } from "./SectionBlock";
import type { EditorElement } from "@/types/cv-document";

type Props = {
  elements: EditorElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<EditorElement>) => void;
};

function ElementLayerInner({ elements, selectedId, onSelect, onChange }: Props) {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {sorted.map((el) =>
        el.type === "section" ? (
          <SectionBlock
            key={el.id}
            element={el}
            isSelected={selectedId === el.id}
            onSelect={onSelect}
            onChange={onChange}
          />
        ) : (
          <TextElement
            key={el.id}
            element={el}
            isSelected={selectedId === el.id}
            onSelect={onSelect}
            onChange={onChange}
          />
        )
      )}
    </>
  );
}

export const ElementLayer = memo(ElementLayerInner);
