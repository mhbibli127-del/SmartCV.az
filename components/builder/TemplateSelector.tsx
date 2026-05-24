"use client";
import React, { useState, useEffect } from "react";
import { useBuilder } from "@/lib/builder-state";
import { useAnalytics } from "@/lib/analytics";
import { ChevronDown, X } from "lucide-react";

interface Template {
  id: number;
  title: string;
  category: string;
  style: string;
  color: string;
  imageUrl: string;
}

export default function TemplateSelector() {
  const { selectedTemplate, setTemplate } = useBuilder();
  const { trackTemplateView } = useAnalytics();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates || []);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSelectTemplate = async (template: Template) => {
    await trackTemplateView(template.id, template.title, template.category);
    setTemplate(template.id, template.title);
    setIsOpen(false);
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-gray-400 transition-all"
      >
        {selectedTemplateData ? (
          <>
            <img
              src={selectedTemplateData.imageUrl}
              alt={selectedTemplateData.title}
              className="w-12 h-16 object-cover rounded"
            />
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">{selectedTemplateData.title}</p>
              <p className="text-xs text-gray-500">{selectedTemplateData.category}</p>
            </div>
          </>
        ) : (
          <span className="text-gray-700 font-medium">Select Template</span>
        )}
        <ChevronDown size={16} className="text-gray-500 ml-auto" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Choose a Template</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {loading ? (
              <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                No templates available
              </div>
            ) : (
              templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedTemplate === template.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={template.imageUrl}
                    alt={template.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <p className="font-semibold text-gray-900 text-xs">{template.title}</p>
                  <p className="text-xs text-gray-500">{template.category}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
