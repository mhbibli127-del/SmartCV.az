"use client";
import React from "react";
import { useBuilder } from "@/lib/builder-state";
import PersonalSectionEditor from "./sections/PersonalSectionEditor";
import SummarySectionEditor from "./sections/SummarySectionEditor";
import ExperienceSectionEditor from "./sections/ExperienceSectionEditor";
import EducationSectionEditor from "./sections/EducationSectionEditor";
import SkillsSectionEditor from "./sections/SkillsSectionEditor";

export default function BuilderCanvas() {
  const { cvData } = useBuilder();

  const renderSection = (section: any) => {
    switch (section.type) {
      case 'personal':
        return <PersonalSectionEditor key={section.id} section={section} />;
      case 'summary':
        return <SummarySectionEditor key={section.id} section={section} />;
      case 'experience':
        return <ExperienceSectionEditor key={section.id} section={section} />;
      case 'education':
        return <EducationSectionEditor key={section.id} section={section} />;
      case 'skills':
        return <SkillsSectionEditor key={section.id} section={section} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">
      <div className="max-w-[800px] mx-auto min-h-[1100px] bg-white rounded-lg shadow-lg border border-gray-200 p-12">
        {/* CV Preview */}
        <div className="space-y-8">
          {cvData.sections
            .sort((a, b) => a.order - b.order)
            .map(renderSection)}
        </div>
      </div>
    </div>
  );
}
