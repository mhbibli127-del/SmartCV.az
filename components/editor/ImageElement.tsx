"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Group, Rect, Image as KonvaImage, Text } from "react-konva";
import type { EditorElement } from "@/types/cv-document";
import { useCanvasElementDrag } from "@/lib/canvas-drag";
import {
  getImageCrop,
  imageCornerRadius,
  loadCanvasImage,
} from "@/components/editor/image-utils";
import { resolveImageSrc } from "@/lib/cv-editor/template-images";
import { isTemplateBaseImage } from "@/lib/cv-editor/template-base-layer";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disableDrag?: boolean;
};

function ImageElementInner({ element, isSelected, onSelect, disableDrag }: Props) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const onSelectOnDragStart = useCallback((id: string) => onSelect(id), [onSelect]);
  const {
    nodeRef,
    dragBoundFunc,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useCanvasElementDrag(element, onSelectOnDragStart);

  const radius = imageCornerRadius(element);

  useEffect(() => {
    const url = isTemplateBaseImage(element.id)
      ? element.src?.trim() ?? ""
      : resolveImageSrc(element.src);
    if (!url) {
      setImage(null);
      return;
    }

    let cancelled = false;

    void loadCanvasImage(url, element.width, element.height, url).then((img) => {
      if (!cancelled) setImage(img);
    });

    return () => {
      cancelled = true;
    };
  }, [element.id, element.src, element.width, element.height]);

  const crop = image ? getImageCrop(image, element.imageScale ?? 1) : null;
  const isBase = isTemplateBaseImage(element.id);
  const isProfilePhoto =
    element.id === "avatar" || element.imageShape === "circle";
  const placeholderFill = element.fill ?? (isProfilePhoto ? "#38bdf8" : "#f4f4f5");
  const showChrome = !isBase && !isProfilePhoto && isSelected;

  return (
    <Group
      ref={nodeRef}
      id={element.id}
      name={element.id}
      width={element.width}
      height={element.height}
      opacity={element.opacity ?? 1}
      draggable={!element.locked && !disableDrag}
      dragBoundFunc={dragBoundFunc}
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={element.width}
        height={element.height}
        fill={isBase ? "transparent" : placeholderFill}
        stroke={showChrome ? "#6366f1" : undefined}
        strokeWidth={showChrome ? 2 : 0}
        cornerRadius={radius}
        dash={!isBase && !isProfilePhoto && !image ? [6, 4] : undefined}
      />
      {image && crop ? (
        <KonvaImage
          image={image}
          width={element.width}
          height={element.height}
          cornerRadius={radius}
          crop={isBase ? undefined : crop}
          imageSmoothingEnabled
          listening={!element.locked}
        />
      ) : !isProfilePhoto ? (
        <Text
          width={element.width}
          height={element.height}
          text="Loading…"
          fontSize={12}
          fill="#a1a1aa"
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      ) : null}
    </Group>
  );
}

export const ImageElement = memo(ImageElementInner);
