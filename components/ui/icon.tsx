"use client";

import type { LucideIcon, LucideProps } from "lucide-react";

/** Standard sizes aligned with common design systems (16 / 20 / 24 px). */
export const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export type IconSize = keyof typeof ICON_SIZES | number;

type IconProps = Omit<LucideProps, "size" | "strokeWidth"> & {
  icon: LucideIcon;
  size?: IconSize;
  /** Accessible name when the icon conveys meaning (e.g. icon-only buttons). */
  label?: string;
};

export function Icon({
  icon: IconComponent,
  size = "md",
  label,
  className = "",
  ...props
}: IconProps) {
  const pixelSize = typeof size === "number" ? size : ICON_SIZES[size];

  return (
    <IconComponent
      size={pixelSize}
      strokeWidth={1.75}
      className={`shrink-0 ${className}`.trim()}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      {...props}
    />
  );
}
