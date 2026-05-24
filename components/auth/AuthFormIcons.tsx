import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/icon";

type InputIconProps = {
  icon: LucideIcon;
};

export function InputFieldIcon({ icon }: InputIconProps) {
  return (
    <Icon
      icon={icon}
      size="md"
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      aria-hidden
    />
  );
}
