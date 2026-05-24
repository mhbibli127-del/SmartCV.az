"use client";
import React from "react";
import { useBuilder } from "@/lib/builder-state";

interface SummarySectionEditorProps {
  section: any;
}

export default function SummarySectionEditor({ section }: SummarySectionEditorProps) {
  const { updateSection } = useBuilder();

  const handleChange = (value: string) => {
    updateSection(section.id, value);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 uppercase tracking-wider">
        Professional Summary
      </h2>
      <div className="space-y-3">
        {/* Preview */}
        <p className="text-sm text-gray-700 leading-relaxed italic">
          {section.content || 'Add a professional summary to highlight your key qualifications and career objectives.'}
        </p>
        
        {/* Edit Form */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Summary
          </label>
          <textarea
            value={section.content}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
            placeholder="Write a compelling 2-3 sentence summary of your professional background and career goals..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Tip: Focus on your key achievements and what you can bring to the role.
          </p>
        </div>
      </div>
    </section>
  );
}
