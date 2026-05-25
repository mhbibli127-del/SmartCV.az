import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[12px] border border-black/[0.08] bg-white px-3.5 py-2 text-sm text-zinc-900 shadow-sm transition-all duration-200",
        "placeholder:text-zinc-400",
        "hover:border-black/[0.12]",
        "focus-visible:border-black/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
