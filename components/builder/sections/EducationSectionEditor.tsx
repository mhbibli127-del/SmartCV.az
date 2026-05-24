"use client";
import React from "react";
import { useBuilder } from "@/lib/builder-state";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface EducationSectionEditorProps {
  section: any;
}

export default function EducationSectionEditor({ section }: EducationSectionEditorProps) {
  const { updateSection } = useBuilder();

  const education = section.content || [];

  const handleAddEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: ''
    };
    updateSection(section.id, [...education, newEducation]);
  };

  const handleUpdateEducation = (index: number, field: string, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    updateSection(section.id, updated);
  };

  const handleRemoveEducation = (index: number) => {
    const updated = education.filter((_: any, i: number) => i !== index);
    updateSection(section.id, updated);
  };

  const handleMoveEducation = (index: number, direction: 'up' | 'down') => {
    const updated = [...education];
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
          Education
        </h2>
        <button
          onClick={handleAddEducation}
          className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Add Education
        </button>
      </div>

      <div className="space-y-4">
        {education.map((edu: any, index: number) => (
          <div key={edu.id || index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Education {index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveEducation(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => handleMoveEducation(index, 'down')}
                  disabled={index === education.length - 1}
                  className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => handleRemoveEducation(index)}
                  className="p-1 hover:bg-red-100 rounded transition-colors text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">School</label>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => handleUpdateEducation(index, 'school', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="University Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Bachelor's, Master's, PhD"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Field of Study</label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => handleUpdateEducation(index, 'field', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={edu.location}
                  onChange={(e) => handleUpdateEducation(index, 'location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="month"
                  value={edu.startDate}
                  onChange={(e) => handleUpdateEducation(index, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="month"
                  value={edu.endDate}
                  onChange={(e) => handleUpdateEducation(index, 'endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">GPA (Optional)</label>
                <input
                  type="text"
                  value={edu.gpa}
                  onChange={(e) => handleUpdateEducation(index, 'gpa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="3.8/4.0"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={edu.description}
                onChange={(e) => handleUpdateEducation(index, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder="Honors, awards, relevant coursework..."
              />
            </div>
          </div>
        ))}

        {education.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
Click {"Add Education"} to get started.

          </div>
        )}
      </div>
    </section>
  );
}
