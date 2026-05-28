"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Group, Rect, Image as KonvaImage, Text } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EditorElement } from "@/types/cv-document";
import { useEditorStore } from "@/lib/editor-store";
import { clampElement, computeAlignmentSnap } from "@/lib/layout-engine";
import {
  getImageCrop,
  imageCornerRadius,
} from "@/components/editor/image-utils";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disableDrag?: boolean;
};

function ImageElementInner({ element, isSelected, onSelect, disableDrag }: Props) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const elements = useEditorStore((s) => s.elements);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setAlignmentGuides = useEditorStore((s) => s.setAlignmentGuides);
  const commitElementMove = useEditorStore((s) => s.commitElementMove);
  const clearAlignmentGuides = useEditorStore((s) => s.clearAlignmentGuides);

  const radius = imageCornerRadius(element);

  useEffect(() => {
    if (!element.src) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = element.src;
  }, [element.src]);

  const handleDragMove = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const node = e.target;
      if (snapEnabled) {
        const snapped = computeAlignmentSnap(elements, element.id, {
          x: node.x(),
          y: node.y(),
          width: element.width,
          height: element.height,
        });
        node.position({ x: snapped.x, y: snapped.y });
        setAlignmentGuides(snapped.guides);
      } else {
        const clamped = clampElement({ ...element, x: node.x(), y: node.y() });
        node.position({ x: clamped.x, y: clamped.y });
      }
    },
    [elements, element, snapEnabled, setAlignmentGuides]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      clearAlignmentGuides();
      commitElementMove(element.id, e.target.x(), e.target.y());
    },
    [element.id, commitElementMove, clearAlignmentGuides]
  );

  const crop = image ? getImageCrop(image, element.imageScale ?? 1) : null;

  return (
    <Group
      id={element.id}
      name={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      draggable={!element.locked && !disableDrag}
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={element.width}
        height={element.height}
        fill={element.fill ?? "#f4f4f5"}
        stroke={isSelected ? "#6366f1" : "#e4e4e7"}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={radius}
        dash={image ? undefined : [6, 4]}
      />
      {image && crop ? (
        <KonvaImage
          image={image}
          width={element.width}
          height={element.height}
          cornerRadius={radius}
          crop={crop}
        />
      ) : (
        <Text
          width={element.width}
          height={element.height}
          text="Upload image"
          fontSize={12}
          fill="#a1a1aa"
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      )}
    </Group>
  );
}

export const ImageElement = memo(ImageElementInner);
