interface SettingsSelectProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export default function SettingsSelect({
  label,
  description,
  value,
  onChange,
  options,
}: SettingsSelectProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
