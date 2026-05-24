"use client";
import React from "react";
import { useBuilder } from "@/lib/builder-state";
import { Plus, Trash2, X } from "lucide-react";

interface SkillsSectionEditorProps {
  section: any;
}

export default function SkillsSectionEditor({ section }: SkillsSectionEditorProps) {
  const { updateSection } = useBuilder();

  const skills = section.content || [];

  const handleAddSkill = () => {
    const newSkill = {
      id: Date.now().toString(),
      name: '',
      level: 'intermediate'
    };
    updateSection(section.id, [...skills, newSkill]);
  };

  const handleUpdateSkill = (index: number, field: string, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    updateSection(section.id, updated);
  };

  const handleRemoveSkill = (index: number) => {
    const updated = skills.filter((_: any, i: number) => i !== index);
    updateSection(section.id, updated);
  };

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
          Skills
        </h2>
        <button
          onClick={handleAddSkill}
          className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Add Skill
        </button>
      </div>

      <div className="space-y-3">
        {skills.map((skill: any, index: number) => (
          <div key={skill.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-1">
              <input
                type="text"
                value={skill.name}
                onChange={(e) => handleUpdateSkill(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Skill name (e.g., JavaScript, Project Management)"
              />
            </div>
            <div className="w-32">
              <select
                value={skill.level}
                onChange={(e) => handleUpdateSkill(index, 'level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                {skillLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleRemoveSkill(index)}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {skills.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
Click {"Add Skill"} to get started.

          </div>
        )}
      </div>

      {/* Quick Add Suggestions */}
      {skills.length < 5 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Project Management', 'Communication', 'Leadership'].slice(0, 5).map((suggestedSkill) => (
              <button
                key={suggestedSkill}
                onClick={() => {
                  const newSkill = {
                    id: Date.now().toString(),
                    name: suggestedSkill,
                    level: 'intermediate'
                  };
                  updateSection(section.id, [...skills, newSkill]);
                }}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                {suggestedSkill}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
