"use client";
import React from "react";
import { Save, Download, Eye, RefreshCw } from "lucide-react";
import { useBuilder } from "@/lib/builder-state";
import { useAnalytics } from "@/lib/analytics";
import TemplateSelector from "./TemplateSelector";

interface BuilderHeaderProps {
  onSave: () => Promise<void>;
  onExport: () => Promise<void>;
  onPreview: () => void;
  onReset: () => void;
}

export default function BuilderHeader({ onSave, onExport, onPreview, onReset }: BuilderHeaderProps) {
  const { isDirty, isSaving, lastSaved } = useBuilder();
  const { trackButtonClick } = useAnalytics();

  const handleSave = async () => {
    await trackButtonClick('Save CV', 'save-cv', '/dashboard/builder');
    await onSave();
  };

  const handleExport = async () => {
    await trackButtonClick('Export PDF', 'export-cv', '/dashboard/builder');
    await onExport();
  };

  const handlePreview = async () => {
    await trackButtonClick('Preview CV', 'preview-cv', '/dashboard/builder');
    onPreview();
  };

  const handleReset = async () => {
    await trackButtonClick('Reset Builder', 'reset-builder', '/dashboard/builder');
    onReset();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interactive CV Builder</h1>
          <p className="text-gray-500 mt-1">
            Drag and drop sections to structure your professional narrative.
            {lastSaved && (
              <span className="ml-2 text-sm text-gray-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-medium"
          >
            <RefreshCw size={18} />
            Reset
          </button>
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all font-medium"
          >
            <Eye size={18} />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${
              isDirty
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-200 text-gray-600 cursor-not-allowed"
            } disabled:opacity-50`}
          >
            <Save size={18} />
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-medium"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <TemplateSelector />
        <div className="flex-1" />
      </div>
    </div>
  );
}
