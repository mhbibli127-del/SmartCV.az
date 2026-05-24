import { CircleCheck } from "lucide-react";
import { Icon } from "@/components/ui/icon";

type AuthFeatureListProps = {
  items: string[];
};

export default function AuthFeatureList({ items }: AuthFeatureListProps) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <Icon icon={CircleCheck} size="sm" className="text-emerald-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
