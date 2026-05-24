'use client';
import React, { useState, useEffect } from 'react';
import TemplateCatalog from '@/app/dashboard/builder/templatecatalog';
import CVFormSection from '@/app/dashboard/builder/cvFormSection';
import { Download, RefreshCw, Wand2, Palette, FormInput, ArrowRight, Save, Sparkles } from 'lucide-react';
import { generatePDF } from '@/lib/pdfGenerator';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api-client';
import { useSubscription } from '@/hooks/useSubscription';

export default function CVGeneratorPage() {
  const [step, setStep] = useState<number>(1);
  const [config, setConfig] = useState({ templateId: '', color: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedCV, setGeneratedCV] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [preFilledData, setPreFilledData] = useState<any>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { success, error: toastError } = useToast();
  const { incrementAI, incrementCV, openUpgradeModal, refreshSubscription } = useSubscription();

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
    if (!incrementAI()) return;
    if (!incrementCV()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate CV');
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
      setError('Failed to generate CV. Please try again.');
      toastError('Generation failed', 'Using fallback preview data.');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setGeneratedCV({
        ...formData,
        summary: `Professional ${formData.title} with extensive experience in digital systems architecture. Modern technologies and optimization methodologies applied to enhance business metrics.`,
        experience: [
          {
            title: formData.title,
            company: "Previous Company",
            startDate: "Jan 2020",
            endDate: "Present",
            description: [
              "Building high-load projects and critical cash modules from scratch in Next.js environment.",
              "Designing advanced responsive interfaces and micro-interactive components using Tailwind CSS.",
              "Structuring external API integrations to improve code quality within the team."
            ]
          }
        ],
        education: [
          {
            degree: "Bachelor's Degree",
            university: "University Name",
            graduationYear: "2020"
          }
        ],
        skills: formData.rawSkills ? formData.rawSkills.split(',').map((s: string) => s.trim()) : ["JavaScript", "React", "Node.js"],
        achievements: [
          "Successfully delivered multiple high-impact projects",
          "Demonstrated strong leadership abilities"
        ]
      });
      setStep(3);
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
      }>('/api/cv/save', {
        cvData: {
          templateId: Number(config.templateId) || 1,
          generatorData: cvData,
        },
        status: 'completed',
        notify: true,
      });

      if (ok) {
        refreshSubscription();
      } else if (status === 403 && data?.code === 'CV_LIMIT_REACHED') {
        toastError(
          'Free plan limit reached',
          data.error || 'Upgrade to Pro to save more CVs.'
        );
        openUpgradeModal();
      } else {
        console.error('Failed to save CV to database', data);
        toastError('Save failed', data?.error || 'Could not save your CV.');
      }
    } catch (err) {
      console.error('Error saving CV:', err);
      toastError('Save failed', 'Something went wrong while saving.');
    }
  };

  const handleDownload = () => {
    if (generatedCV) {
      try {
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

  return (
    <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
             AI-Powered
           </div>
           <h1 className="text-5xl font-black text-gray-900">AI CV Generator</h1>
           <p className="text-gray-600 text-lg max-w-2xl mx-auto">Transform your career data into a compelling, ATS-optimized resume using our advanced AI engine.</p>
        </div>
        
        <div className="flex items-center justify-center space-x-4 mb-16">
           {[
             { s: 1, label: "Template", icon: Palette },
             { s: 2, label: "Content", icon: FormInput },
             { s: 3, label: "Result", icon: Wand2 }
           ].map((item, index) => (
             <React.Fragment key={item.s}>
               <div className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
                 step >= item.s 
                   ? 'bg-black text-white' 
                   : 'bg-gray-100 text-gray-400'
               }`}>
                  <item.icon size={20} />
                  <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
               </div>
               {index < 2 && (
                 <ArrowRight size={20} className={step > item.s ? 'text-black' : 'text-gray-300'} />
               )}
             </React.Fragment>
           ))}
        </div>

        {step === 1 && <TemplateCatalog onSelect={handleTemplateSelect} />}
        
        {step === 2 && (
          <CVFormSection 
            onBack={() => setStep(1)} 
            onSubmit={handleFormSubmit} 
            isLoading={loading}
            preFilledData={preFilledData}
          />
        )}

        {step === 3 && generatedCV && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: config.color }} />
              
              {/* Personal Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-3xl font-bold text-gray-900">{generatedCV.fullName}</h3>
                <p className="text-lg font-semibold mt-2" style={{ color: config.color }}>{generatedCV.title}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  {generatedCV.email && <span>{generatedCV.email}</span>}
                  {generatedCV.phone && <span>{generatedCV.phone}</span>}
                  {generatedCV.location && <span>{generatedCV.location}</span>}
                  {generatedCV.website && <span>{generatedCV.website}</span>}
                </div>
              </div>

              {/* Professional Summary */}
              {generatedCV.summary && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Professional Summary</h4>
                  <p className="text-base text-gray-700 leading-relaxed">{generatedCV.summary}</p>
                </div>
              )}

              {/* Experience */}
              {generatedCV.experience && generatedCV.experience.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Work Experience</h4>
                  <div className="space-y-4">
                    {generatedCV.experience.map((exp: any, index: number) => (
                      <div key={index} className="border-l-2 border-black pl-4">
                        <h5 className="font-semibold text-gray-900">{exp.title}</h5>
                        <p className="text-gray-600 text-sm">{exp.company}</p>
                        <p className="text-gray-500 text-xs mt-1">{exp.startDate} - {exp.endDate}</p>
                        {Array.isArray(exp.description) ? (
                          <ul className="mt-2 space-y-1 text-sm text-gray-700">
                            {exp.description.map((desc: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-black">•</span>
                                <span>{desc}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-gray-700">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {generatedCV.education && generatedCV.education.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Education</h4>
                  <div className="space-y-4">
                    {generatedCV.education.map((edu: any, index: number) => (
                      <div key={index} className="border-l-2 border-black pl-4">
                        <h5 className="font-semibold text-gray-900">{edu.degree}</h5>
                        <p className="text-gray-600 text-sm">{edu.university}</p>
                        <p className="text-gray-500 text-xs mt-1">{edu.graduationYear}</p>
                        {edu.gpa && <p className="text-gray-500 text-xs">GPA: {edu.gpa}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {generatedCV.skills && generatedCV.skills.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedCV.skills.map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-black text-white rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {generatedCV.achievements && generatedCV.achievements.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Key Achievements</h4>
                  <ul className="space-y-3">
                    {generatedCV.achievements.map((achievement: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {autoSaving ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>Auto-saving...</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <Save size={16} />
                      <span>Last saved: {lastSaved}</span>
                    </>
                  ) : null}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-semibold"
                  >
                    <Download size={20} />
                    Download CV
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
                  >
                    <RefreshCw size={20} />
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
