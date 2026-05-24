import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "gradient";

interface SettingsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-800 border border-transparent",
  secondary:
    "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 border border-transparent",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent",
  gradient:
    "bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 border border-transparent shadow-sm",
};

export default function SettingsButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: SettingsButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
