"use client";

import React, { useState } from "react";
import {
  User,
  Briefcase,
  Sparkles,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/page-shell";
import { cn } from "@/lib/utils";

interface FormProps {
  onBack: () => void;
  onSubmit: (formData: Record<string, string>) => void;
  isLoading: boolean;
  preFilledData?: Record<string, string>;
  accentColor?: string;
}

function LivePreview({
  data,
  accentColor = "#18181b",
  isGenerating,
}: {
  data: Record<string, string>;
  accentColor?: string;
  isGenerating?: boolean;
}) {
  const skills = data.rawSkills
    ? data.rawSkills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8)
    : [];

  return (
    <Surface className="sticky top-24 h-fit" padding>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Live preview</p>
        {isGenerating && (
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1 w-1 rounded-full bg-zinc-400 animate-thinking"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </span>
            Generating preview
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-[12px] border border-black/[0.06] bg-zinc-50/80">
        <div className="h-1" style={{ backgroundColor: accentColor }} />
        <div className="space-y-5 p-6">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-zinc-900">
              {data.fullName || "Your name"}
            </h3>
            <p className="mt-1 text-sm font-medium" style={{ color: accentColor }}>
              {data.title || "Professional title"}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.location && <span>{data.location}</span>}
            </div>
          </div>

          {(data.rawExperience || isGenerating) && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Experience
              </p>
              {isGenerating ? (
                <div className="space-y-2">
                  <div className="skeleton h-2 w-full rounded" />
                  <div className="skeleton h-2 w-5/6 rounded" />
                  <div className="skeleton h-2 w-4/6 rounded" />
                </div>
              ) : (
                <p className="line-clamp-4 text-xs leading-relaxed text-zinc-600">
                  {data.rawExperience}
                </p>
              )}
            </div>
          )}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-white px-2 py-0.5 text-[10px] text-zinc-600 ring-1 ring-black/[0.06]"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {!data.fullName && !data.title && !data.rawExperience && !isGenerating && (
            <p className="py-8 text-center text-xs text-zinc-400">
              Start typing — your CV preview updates in real time.
            </p>
          )}
        </div>
      </div>
    </Surface>
  );
}

export default function CVFormSection({
  onBack,
  onSubmit,
  isLoading,
  preFilledData,
  accentColor,
}: FormProps) {
  const [formData, setData] = useState({
    fullName: preFilledData?.fullName || "",
    email: preFilledData?.email || "",
    phone: preFilledData?.phone || "",
    location: preFilledData?.location || "",
    website: preFilledData?.website || "",
    title: preFilledData?.title || "",
    rawExperience: preFilledData?.rawExperience || "",
    rawEducation: preFilledData?.rawEducation || "",
    rawSkills: preFilledData?.rawSkills || "",
    targetIndustry: preFilledData?.targetIndustry || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.title) return;
    onSubmit(formData);
  };

  const fieldClass =
    "w-full pl-10 pr-3.5 py-2.5 rounded-[12px] border border-black/[0.08] bg-white text-sm transition-all focus:border-black/[0.12] focus:outline-none focus:ring-2 focus:ring-zinc-900/10";

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to templates
      </button>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Left — input panel */}
        <div className="space-y-6">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">Step 2</p>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              Tell us about yourself
            </h2>
            <p className="text-sm text-zinc-500">
              Məlumatlarınızı ATS-uyğun, oxunaqlı CV strukturuna çeviririk.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Surface padding className="space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Personal
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-zinc-600">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      className={fieldClass}
                      value={formData.fullName}
                      onChange={(e) => setData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className={fieldClass}
                      value={formData.email}
                      onChange={(e) => setData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="tel"
                      placeholder="+994 50 000 00 00"
                      className={fieldClass}
                      value={formData.phone}
                      onChange={(e) => setData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Baku, Azerbaijan"
                      className={fieldClass}
                      value={formData.location}
                      onChange={(e) => setData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="url"
                      placeholder="https://yoursite.com"
                      className={fieldClass}
                      value={formData.website}
                      onChange={(e) => setData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </Surface>

            <Surface padding className="space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Professional
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600">Current title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Senior Software Engineer"
                    required
                    className={fieldClass}
                    value={formData.title}
                    onChange={(e) => setData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600">Work experience</label>
                <textarea
                  rows={4}
                  placeholder="İş təcrübənizi qısa yazın — strukturlaşdırılmış formata çevriləcək."
                  className={cn(fieldClass, "resize-none pl-3.5 leading-relaxed")}
                  value={formData.rawExperience}
                  onChange={(e) => setData({ ...formData, rawExperience: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600">Education</label>
                <textarea
                  rows={3}
                  placeholder="Degrees, institutions, graduation years…"
                  className={cn(fieldClass, "resize-none pl-3.5 leading-relaxed")}
                  value={formData.rawEducation}
                  onChange={(e) => setData({ ...formData, rawEducation: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600">Skills</label>
                <textarea
                  rows={3}
                  placeholder="JavaScript, React, Node.js, AWS…"
                  className={cn(fieldClass, "resize-none pl-3.5 leading-relaxed")}
                  value={formData.rawSkills}
                  onChange={(e) => setData({ ...formData, rawSkills: e.target.value })}
                />
              </div>
            </Surface>

            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating your CV…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Continue to preview
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right — live preview */}
        <LivePreview data={formData} accentColor={accentColor} isGenerating={isLoading} />
      </div>
    </div>
  );
}
