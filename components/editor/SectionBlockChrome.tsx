"use client";

import { memo } from "react";
import { Rect, Line, Circle } from "react-konva";
import type { EditorElement } from "@/types/cv-document";
import { useDesignStore } from "@/lib/design-store";

type Props = {
  element: EditorElement;
  isSelected: boolean;
  width: number;
  height: number;
};

function SectionBlockChromeInner({ element, isSelected, width, height }: Props) {
  const atsSafeMode = useDesignStore((s) => s.atsSafeMode);
  const accent = useDesignStore((s) => s.activeTheme.palette.accent);
  const style = atsSafeMode ? "default" : element.sectionStyle ?? "default";
  const stroke = isSelected ? "#6366f1" : "#e4e4e7";

  if (style === "bordered") {
    return (
      <>
        <Rect
          width={width}
          height={height}
          fill="#ffffff"
          stroke={accent}
          strokeWidth={2}
          cornerRadius={4}
        />
      </>
    );
  }

  if (style === "compact") {
    return (
      <Rect
        width={width}
        height={height}
        fill="#fafafa"
        stroke={stroke}
        strokeWidth={isSelected ? 1.5 : 1}
        cornerRadius={4}
      />
    );
  }

  if (style === "modern") {
    return (
      <>
        <Rect width={width} height={height} fill="transparent" />
        <Line points={[0, height - 2, width, height - 2]} stroke={accent} strokeWidth={2} />
        {isSelected && (
          <Rect width={width} height={height} stroke="#6366f1" strokeWidth={1} listening={false} />
        )}
      </>
    );
  }

  if (style === "timeline") {
    return (
      <>
        <Rect
          width={width}
          height={height}
          fill="#fafafa"
          stroke={stroke}
          strokeWidth={1}
          cornerRadius={6}
        />
        <Line points={[20, 12, 20, height - 12]} stroke={accent} strokeWidth={2} />
        <Circle x={20} y={22} radius={5} fill={accent} />
        {isSelected && (
          <Rect
            width={width}
            height={height}
            stroke="#6366f1"
            strokeWidth={1.5}
            cornerRadius={6}
            listening={false}
          />
        )}
      </>
    );
  }

  if (style === "cards") {
    return (
      <>
        <Rect
          x={2}
          y={4}
          width={width}
          height={height}
          fill="rgba(0,0,0,0.06)"
          cornerRadius={10}
          listening={false}
        />
        <Rect
          width={width}
          height={height}
          fill="#ffffff"
          stroke={stroke}
          strokeWidth={isSelected ? 1.5 : 1}
          cornerRadius={10}
          shadowColor="rgba(0,0,0,0.08)"
          shadowBlur={8}
          shadowOffset={{ x: 0, y: 2 }}
        />
      </>
    );
  }

  return (
    <Rect
      width={width}
      height={height}
      fill="#fafafa"
      stroke={stroke}
      strokeWidth={isSelected ? 1.5 : 1}
      cornerRadius={8}
    />
  );
}

export const SectionBlockChrome = memo(SectionBlockChromeInner);

export function sectionContentLayout(element: EditorElement, width: number, height: number) {
  const style = element.sectionStyle ?? "default";
  const compact = style === "compact";
  const timeline = style === "timeline";
  return {
    labelX: timeline ? 36 : 12,
    labelY: compact ? 6 : 10,
    contentX: timeline ? 36 : 12,
    contentY: compact ? 22 : timeline ? 32 : 28,
    contentW: width - (timeline ? 48 : 24),
    contentH: height - (compact ? 28 : 36),
    fontSize: compact ? (element.fontSize ?? 11) : (element.fontSize ?? 12),
    labelSize: 8,
  };
}
