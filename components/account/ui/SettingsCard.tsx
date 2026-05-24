import type { ReactNode } from "react";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function SettingsCard({
  title,
  description,
  children,
  footer,
  className = "",
}: SettingsCardProps) {
  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="border-b border-gray-100 px-6 py-5">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="px-6 py-6">{children}</div>
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4 rounded-b-xl">
          {footer}
        </div>
      )}
    </section>
  );
}
