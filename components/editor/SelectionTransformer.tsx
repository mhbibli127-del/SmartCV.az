"use client";

import { memo, useEffect, useRef } from "react";
import { Transformer } from "react-konva";
import type Konva from "konva";
import { useEditorStore } from "@/lib/editor-store";
import { MIN_ELEMENT_HEIGHT, MIN_ELEMENT_WIDTH } from "@/lib/layout-engine";

type Props = {
  layerRef: React.RefObject<Konva.Layer | null>;
};

function SelectionTransformerInner({ layerRef }: Props) {
  const trRef = useRef<Konva.Transformer>(null);
  const selectedId = useEditorStore((s) => s.selectedId);
  const elements = useEditorStore((s) => s.elements);
  const resizeElement = useEditorStore((s) => s.resizeElement);

  const selected = elements.find((e) => e.id === selectedId);

  useEffect(() => {
    const tr = trRef.current;
    const layer = layerRef.current;
    if (!tr || !layer) return;

    if (!selectedId || selected?.locked) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    const node = layer.findOne(`#${selectedId}`);
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedId, selected?.locked, elements, layerRef]);

  if (!selectedId || selected?.locked) return null;

  return (
    <Transformer
      ref={trRef}
      rotateEnabled={false}
      borderStroke="#6366f1"
      borderStrokeWidth={1.5}
      anchorStroke="#6366f1"
      anchorFill="#ffffff"
      anchorSize={8}
      anchorCornerRadius={2}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < MIN_ELEMENT_WIDTH || newBox.height < MIN_ELEMENT_HEIGHT) {
          return oldBox;
        }
        return newBox;
      }}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Group;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);

        const width = Math.max(MIN_ELEMENT_WIDTH, node.width() * scaleX);
        const height = Math.max(MIN_ELEMENT_HEIGHT, node.height() * scaleY);

        resizeElement(selectedId, {
          x: node.x(),
          y: node.y(),
          width,
          height,
        });
      }}
    />
  );
}

export const SelectionTransformer = memo(SelectionTransformerInner);
