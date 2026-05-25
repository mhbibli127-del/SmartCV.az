import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:scale-[1.02]",
        destructive: "bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02]",
        outline:
          "border border-black/[0.08] bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 hover:scale-[1.02]",
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 hover:scale-[1.02]",
        ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02]",
        link: "text-zinc-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 rounded-[12px] px-4 py-2",
        sm: "h-8 rounded-[10px] px-3 text-xs",
        lg: "h-11 rounded-[12px] px-6",
        icon: "h-9 w-9 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
