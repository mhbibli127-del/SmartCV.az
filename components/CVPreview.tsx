"use client";

import { motion } from "framer-motion";
import PanelCard from "@/components/PanelCard";
import type { CVData } from "@/types/cv";

type CVPreviewProps = {
  cvData: CVData;
};

export default function CVPreview({ cvData }: CVPreviewProps) {
  const hasContent = Boolean(cvData.name || cvData.email || cvData.skills.length || cvData.experience.length || cvData.education.length);

  return (
    <PanelCard
      title="Live CV Preview"
      description="View your generated resume in a polished, modern layout before exporting or optimizing."
      badge="Preview"
      className="overflow-hidden"
    >
      {hasContent ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Personal</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">{cvData.name || "Your name here"}</h2>
              <p className="mt-1 text-sm text-slate-600">{cvData.email || "your.email@example.com"}</p>
            </div>

            {cvData.skills.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cvData.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {cvData.experience.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Experience</p>
                <div className="mt-3 space-y-4">
                  {cvData.experience.map((item) => (
                    <div key={`${item.title}-${item.company}`} className="rounded-3xl bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                          <p className="text-sm text-slate-500">{item.company}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {cvData.education.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Education</p>
                <div className="mt-3 space-y-4">
                  {cvData.education.map((item) => (
                    <div key={`${item.degree}-${item.university}`} className="rounded-3xl bg-white p-5 shadow-sm">
                      <p className="text-sm font-semibold text-slate-950">{item.degree}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.university}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-400/40 bg-slate-950/10 p-10 text-center text-slate-500">
          <p className="text-sm font-medium">Your career preview will appear here after generating a CV.</p>
        </div>
      )}
    </PanelCard>
  );
}
