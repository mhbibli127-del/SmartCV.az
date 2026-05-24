"use client";
import React from "react";
import { useBuilder } from "@/lib/builder-state";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface ExperienceSectionEditorProps {
  section: any;
}

export default function ExperienceSectionEditor({ section }: ExperienceSectionEditorProps) {
  const { updateSection } = useBuilder();

  const experiences = section.content || [];

  const handleAddExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    updateSection(section.id, [...experiences, newExperience]);
  };

  const handleUpdateExperience = (index: number, field: string, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    updateSection(section.id, updated);
  };

  const handleRemoveExperience = (index: number) => {
    const updated = experiences.filter((_: any, i: number) => i !== index);
    updateSection(section.id, updated);
  };

  const handleMoveExperience = (index: number, direction: 'up' | 'down') => {
    const updated = [...experiences];
    if (direction === 'up' && index > 0) {
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    } else if (direction === 'down' && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    }
    updateSection(section.id, updated);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
          Work Experience
        </h2>
        <button
          onClick={handleAddExperience}
          className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Add Experience
        </button>
      </div>

      <div className="space-y-4">
        {experiences.map((exp: any, index: number) => (
          <div key={exp.id || index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Experience {index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveExperience(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => handleMoveExperience(index, 'down')}
                  disabled={index === experiences.length - 1}
                  className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => handleRemoveExperience(index)}
                  className="p-1 hover:bg-red-100 rounded transition-colors text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => handleUpdateExperience(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => handleUpdateExperience(index, 'location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="City, Country"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => handleUpdateExperience(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => handleUpdateExperience(index, 'endDate', e.target.value)}
                    disabled={exp.current}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id={`current-${index}`}
                checked={exp.current}
                onChange={(e) => handleUpdateExperience(index, 'current', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor={`current-${index}`} className="text-xs text-gray-700">Currently working here</label>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={exp.description}
                onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder="Describe your responsibilities and achievements..."
              />
            </div>
          </div>
        ))}

        {experiences.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
Click {"Add Experience"} to get started.

          </div>
        )}
      </div>
    </section>
  );
}
