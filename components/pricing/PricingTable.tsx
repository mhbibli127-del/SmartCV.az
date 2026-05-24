"use client";

import { Check, X } from "lucide-react";
import { COMPARISON_FEATURES } from "@/lib/plans";

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={18} className="mx-auto text-emerald-600" />
    ) : (
      <X size={18} className="mx-auto text-gray-300" />
    );
  }
  return <span className="text-sm text-gray-700">{value}</span>;
}

export default function PricingTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Feature</th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900">Free</th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900">Pro</th>
              <th className="px-6 py-4 text-center font-semibold text-gray-900">Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {COMPARISON_FEATURES.map((row) => (
              <tr key={row.label} className="transition-colors hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">{row.label}</td>
                <td className="px-6 py-4 text-center">
                  <CellValue value={row.free} />
                </td>
                <td className="px-6 py-4 text-center">
                  <CellValue value={row.pro} />
                </td>
                <td className="px-6 py-4 text-center">
                  <CellValue value={row.premium} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
