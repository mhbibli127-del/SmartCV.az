"use client";
import React from "react";
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useBuilder } from "@/lib/builder-state";
import { useAnalytics } from "@/lib/analytics";

const availableSections = [
  { id: 'personal', type: 'personal', title: 'Personal Information', icon: '👤' },
  { id: 'summary', type: 'summary', title: 'Professional Summary', icon: '📝' },
  { id: 'experience', type: 'experience', title: 'Work Experience', icon: '💼' },
  { id: 'education', type: 'education', title: 'Education', icon: '🎓' },
  { id: 'skills', type: 'skills', title: 'Skills', icon: '⚡' },
  { id: 'projects', type: 'projects', title: 'Projects', icon: '🚀' },
  { id: 'languages', type: 'languages', title: 'Languages', icon: '🌍' }
];

export default function BuilderSidebar() {
  const { cvData, addSection, removeSection, reorderSections } = useBuilder();
  const { trackButtonClick } = useAnalytics();
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  const activeSectionIds = cvData.sections.map(s => s.id);
  const availableToAdd = availableSections.filter(s => !activeSectionIds.includes(s.id));

  const handleAddSection = async (section: typeof availableSections[0]) => {
    await trackButtonClick('Add Section', `add-${section.id}`, '/dashboard/builder');
    addSection({
      id: section.id,
      type: section.type as any,
      title: section.title,
      content: section.type === 'personal' ? {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        website: ''
      } : section.type === 'summary' ? '' : [],
      order: cvData.sections.length
    });
  };

  const handleRemoveSection = async (sectionId: string) => {
    await trackButtonClick('Remove Section', `remove-${sectionId}`, '/dashboard/builder');
    removeSection(sectionId);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newSections = [...cvData.sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    await trackButtonClick('Move Section Up', `move-up-${index}`, '/dashboard/builder');
    reorderSections(newSections);
  };

  const handleMoveDown = async (index: number) => {
    if (index === cvData.sections.length - 1) return;
    const newSections = [...cvData.sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    await trackButtonClick('Move Section Down', `move-down-${index}`, '/dashboard/builder');
    reorderSections(newSections);
  };

  return (
    <div className="w-80 bg-white h-full p-6 space-y-6 overflow-y-auto border-r border-gray-200">
      {/* Active Sections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Active Sections</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {cvData.sections.length}
          </span>
        </div>
        <div className="space-y-2">
          {cvData.sections.map((section, index) => (
            <div
              key={section.id}
              className="group p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <GripVertical size={16} className="text-gray-400 cursor-grab" />
                  <span className="text-sm font-semibold text-gray-700">{section.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === cvData.sections.length - 1}
                    className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => handleRemoveSection(section.id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Add Section</h3>
          <button
            type="button"
            onClick={() => availableToAdd[0] && handleAddSection(availableToAdd[0])}
            disabled={availableToAdd.length === 0}
            className="p-1.5 bg-black rounded-lg text-white hover:bg-gray-800 transition-all disabled:opacity-40"
            aria-label="Add first available section"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {availableToAdd.map((section) => (
            <button
              key={section.id}
              onClick={() => handleAddSection(section)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-white transition-all text-left group"
            >
              <span className="text-lg">{section.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{section.title}</span>
              <Plus size={14} className="ml-auto text-gray-400 group-hover:text-black transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
