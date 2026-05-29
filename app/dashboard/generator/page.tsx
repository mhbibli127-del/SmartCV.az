'use client';
import React, { useState, useEffect } from 'react';
import TemplateCatalog from '@/app/dashboard/builder/templatecatalog';
import CVFormSection from '@/app/dashboard/builder/cvFormSection';
import Link from "next/link";
import { Download, RefreshCw, Wand2, Palette, FormInput, Save, Check, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api-client';
import { PageShell, PageHeader, Surface } from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PdfImportDropzone } from '@/components/pdf/PdfImportDropzone';
import type { PdfImportPayload } from '@/types/pdf-import';

export default function CVGeneratorPage() {
  const [step, setStep] = useState<number>(1);
  const [config, setConfig] = useState({ templateId: '', color: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedCV, setGeneratedCV] = useState<any>(null);
  const [savedCvId, setSavedCvId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [preFilledData, setPreFilledData] = useState<any>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    const templateData = localStorage.getItem('selectedTemplateData');
    const pdfData = localStorage.getItem('extractedPdfData');
    const templateColor = localStorage.getItem('selectedTemplateColor');

    if (templateData) {
      setPreFilledData(JSON.parse(templateData));
      if (templateColor) {
        setConfig(prev => ({ ...prev, color: templateColor }));
      }
      localStorage.removeItem('selectedTemplateData');
      localStorage.removeItem('selectedTemplateColor');
    } else if (pdfData) {
      setPreFilledData(JSON.parse(pdfData));
      localStorage.removeItem('extractedPdfData');
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (generatedCV) {
      setAutoSaving(true);
      const timer = setTimeout(() => {
        localStorage.setItem('cvDraft', JSON.stringify(generatedCV));
        setLastSaved(new Date().toLocaleTimeString());
        setAutoSaving(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [generatedCV]);

  const handleTemplateSelect = (templateId: string, color: string) => {
    setConfig({ templateId, color });
    setStep(2);
  };

  const handleFormSubmit = async (formData: any) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/cv/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate CV');
      }

      const data = await response.json();
      const completeCV = {
        ...formData,
        ...data
      };
      
      setGeneratedCV(completeCV);
      
      await handleCVSave(completeCV);
      await api.post('/api/cv/complete', {
        cvData: {
          templateId: Number(config.templateId) || 1,
          generatorData: completeCV,
        },
      });
      success('Resume completed', 'Your AI-generated CV is ready.');
      
      setStep(3);
    } catch (err) {
      console.error('CV generation failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate CV. Please try again.';
      setError(message);
      toastError('Generation failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleCVSave = async (cvData: any) => {
    try {
      const { ok, status, data } = await api.post<{
        message?: string;
        error?: string;
        code?: string;
        cvId?: string;
      }>('/api/cv/save', {
        cvData: {
          templateId: Number(config.templateId) || 1,
          generatorData: cvData,
        },
        status: 'completed',
        notify: true,
      });

      if (ok) {
        if (data?.cvId) setSavedCvId(String(data.cvId));
      } else if (status === 403 && data?.code === 'CV_LIMIT_REACHED') {
        toastError('Limit reached', data.error || 'Could not save your CV.');
      } else {
        console.error('Failed to save CV to database', data);
        toastError('Save failed', data?.error || 'Could not save your CV.');
      }
    } catch (err) {
      console.error('Error saving CV:', err);
      toastError('Save failed', 'Something went wrong while saving.');
    }
  };

  const handleDownload = async () => {
    if (generatedCV) {
      try {
        const { generatePDF } = await import("@/lib/pdfGenerator");
        const { pdfBase64, fileName } = generatePDF(generatedCV, config.color || '#000000');
        
        // Client-side download
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${pdfBase64}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Failed to generate PDF:', error);
        toastError('Download failed', 'Could not generate PDF. Please try again.');
      }
    }
  };

  const handleRegenerate = async () => {
    if (generatedCV) {
      setStep(2);
    }
  };

  const handlePdfImported = (data: PdfImportPayload) => {
    setPreFilledData(data);
    if (config.templateId) {
      setStep(2);
      success('PDF imported', 'Your details were pre-filled — review and generate.');
    } else {
      success('PDF imported', 'Pick a template next, then review your details.');
    }
  };

  const steps = [
    { s: 1, label: "Template", icon: Palette },
    { s: 2, label: "Content", icon: FormInput },
    { s: 3, label: "Result", icon: Wand2 },
  ] as const;

  return (
    <PageShell>
      <PageHeader
        eyebrow="AI Generator"
        title="Create your CV with AI"
        description="Pick a template, add your details, and let AI craft a professional resume."
      />

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((item, index) => (
          <React.Fragment key={item.s}>
            <div
              className={cn(
                "flex items-center gap-2 rounded-[12px] px-4 py-2 text-xs font-medium transition-all duration-200",
                step >= item.s
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-400"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  step > item.s ? "bg-zinc-900" : "bg-zinc-200"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <Surface padding className="max-w-2xl mx-auto">
        <PdfImportDropzone
          compact
          label="Already have a CV? Import PDF to pre-fill"
          onImported={handlePdfImported}
          onError={(msg) => toastError('Import failed', msg)}
        />
      </Surface>

      {step === 1 && <TemplateCatalog onSelect={handleTemplateSelect} />}

      {step === 2 && (
        <CVFormSection
          onBack={() => setStep(1)}
          onSubmit={handleFormSubmit}
          isLoading={loading}
          preFilledData={preFilledData}
          accentColor={config.color || "#18181b"}
        />
      )}

      {step === 3 && generatedCV && (
        <div className="mx-auto max-w-3xl space-y-6">
          {error && (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Surface padding className="relative overflow-hidden">
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ backgroundColor: config.color || "#18181b" }}
            />

            <div className="space-y-8 pt-2">
              <div className="border-b border-black/[0.06] pb-6">
                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {generatedCV.fullName}
                </h3>
                <p
                  className="mt-1 text-base font-medium"
                  style={{ color: config.color || "#18181b" }}
                >
                  {generatedCV.title}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                  {generatedCV.email && <span>{generatedCV.email}</span>}
                  {generatedCV.phone && <span>{generatedCV.phone}</span>}
                  {generatedCV.location && <span>{generatedCV.location}</span>}
                  {generatedCV.website && <span>{generatedCV.website}</span>}
                </div>
              </div>

              {generatedCV.summary && (
                <section className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Summary
                  </h4>
                  <p className="text-sm leading-relaxed text-zinc-600">{generatedCV.summary}</p>
                </section>
              )}

              {generatedCV.experience?.length > 0 && (
                <section className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Experience
                  </h4>
                  {generatedCV.experience.map((exp: { title: string; company: string; startDate: string; endDate: string; description: string | string[] }, index: number) => (
                    <div key={index} className="border-l-2 border-zinc-200 pl-4">
                      <h5 className="font-medium text-zinc-900">{exp.title}</h5>
                      <p className="text-sm text-zinc-500">{exp.company}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {exp.startDate} – {exp.endDate}
                      </p>
                      {Array.isArray(exp.description) ? (
                        <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                          {exp.description.map((desc: string, i: number) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-zinc-300">·</span>
                              <span>{desc}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-zinc-600">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {generatedCV.education?.length > 0 && (
                <section className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Education
                  </h4>
                  {generatedCV.education.map((edu: { degree: string; university: string; graduationYear: string; gpa?: string }, index: number) => (
                    <div key={index} className="border-l-2 border-zinc-200 pl-4">
                      <h5 className="font-medium text-zinc-900">{edu.degree}</h5>
                      <p className="text-sm text-zinc-500">{edu.university}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{edu.graduationYear}</p>
                    </div>
                  ))}
                </section>
              )}

              {generatedCV.skills?.length > 0 && (
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedCV.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <div className="flex flex-col gap-4 border-t border-black/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  {autoSaving ? (
                    <>
                      <Save className="h-3.5 w-3.5 animate-pulse" />
                      Saving…
                    </>
                  ) : lastSaved ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      Saved at {lastSaved}
                    </>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleRegenerate}>
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                  {savedCvId && (
                    <>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/builder?id=${savedCvId}&mode=form`}>
                          Edit in Builder
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/dashboard/builder/editor?id=${savedCvId}`}>
                          Visual Editor
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </>
                  )}
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </Surface>
        </div>
      )}
    </PageShell>
  );
}
