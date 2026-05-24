"use client";
import React from "react";
import { useBuilder } from "@/lib/builder-state";

interface PersonalSectionEditorProps {
  section: any;
}

export default function PersonalSectionEditor({ section }: PersonalSectionEditorProps) {
  const { updateSection } = useBuilder();

  const handleChange = (field: string, value: string) => {
    updateSection(section.id, {
      ...section.content,
      [field]: value
    });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-900 pb-2">
        {section.content.name || 'Your Name'}
      </h2>
      <div className="text-sm text-gray-600 space-y-1">
        {section.content.email && <p>{section.content.email}</p>}
        {section.content.phone && <p>{section.content.phone}</p>}
        {section.content.location && <p>{section.content.location}</p>}
      </div>
      
      {/* Edit Form */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Edit Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={section.content.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={section.content.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={section.content.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="+1 234 567 890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={section.content.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input
              type="url"
              value={section.content.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="linkedin.com/in/johndoe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={section.content.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="johndoe.com"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
