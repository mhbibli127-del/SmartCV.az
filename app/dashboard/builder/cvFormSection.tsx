'use client';
import React, { useState } from 'react';
import { User, Briefcase, Sparkles, ArrowLeft, Loader2, Mail, Phone, GraduationCap, MapPin, Globe } from 'lucide-react';

interface FormProps {
  onBack: () => void;
  onSubmit: (formData: any) => void;
  isLoading: boolean;
  preFilledData?: any;
}

export default function CVFormSection({ onBack, onSubmit, isLoading, preFilledData }: FormProps) {
  const [formData, setData] = useState({
    fullName: preFilledData?.fullName || '',
    email: preFilledData?.email || '',
    phone: preFilledData?.phone || '',
    location: preFilledData?.location || '',
    website: preFilledData?.website || '',
    title: preFilledData?.title || '',
    rawExperience: preFilledData?.rawExperience || '',
    rawEducation: preFilledData?.rawEducation || '',
    rawSkills: preFilledData?.rawSkills || '',
    targetIndustry: preFilledData?.targetIndustry || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.title) return;
    onSubmit(formData);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <button onClick={onBack} className="inline-flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} />
        <span>Back to template selection</span>
      </button>

      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 bg-black text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={12} className="text-white" />
          <span>Step 2: AI-Powered Data Entry</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Enter Your Information</h2>
        <p className="text-gray-500 text-sm">
          Simply provide your details. AI will transform them into a professional, beautiful CV.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  value={formData.fullName}
                  onChange={e => setData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  value={formData.email}
                  onChange={e => setData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="tel"
                  placeholder="+1 234 567 890"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  value={formData.phone}
                  onChange={e => setData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="New York, NY"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  value={formData.location}
                  onChange={e => setData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Website/Portfolio</label>
              <div className="relative">
                <Globe className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  value={formData.website}
                  onChange={e => setData({...formData, website: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Target Industry</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Technology, Finance, Healthcare..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                  value={formData.targetIndustry}
                  onChange={e => setData({...formData, targetIndustry: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-2">Professional Information</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Current Title / Position</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Senior Software Engineer"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                value={formData.title}
                onChange={e => setData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Work Experience (AI will format this)</label>
            <textarea
              rows={4}
              placeholder="Describe your work history briefly. AI will extract and format it professionally. Example: Worked at Google as Senior Developer for 3 years, led a team of 5 engineers, built scalable systems..."
              className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all resize-none leading-relaxed"
              value={formData.rawExperience}
              onChange={e => setData({...formData, rawExperience: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Education (AI will format this)</label>
            <textarea
              rows={3}
              placeholder="Your educational background. Example: BS in Computer Science from MIT, graduated 2020, GPA 3.8..."
              className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all resize-none leading-relaxed"
              value={formData.rawEducation}
              onChange={e => setData({...formData, rawEducation: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">Skills (AI will categorize and highlight)</label>
            <textarea
              rows={3}
              placeholder="List your skills separated by commas. Example: JavaScript, React, Node.js, Python, Machine Learning, AWS, Docker..."
              className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all resize-none leading-relaxed"
              value={formData.rawSkills}
              onChange={e => setData({...formData, rawSkills: e.target.value})}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center space-x-2 bg-black text-white font-medium py-4 rounded-xl hover:bg-gray-900 transition-all text-sm disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>AI is creating your beautiful CV...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} className="text-white" />
              <span>Generate Professional CV with AI</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}