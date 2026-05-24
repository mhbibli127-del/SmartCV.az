"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Share2, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CVPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading preview...</p>
          </div>
        </div>
      }
    >
      <CVPreviewContent />
    </Suspense>
  );
}

function CVPreviewContent() {
  const searchParams = useSearchParams();
  const [cvData, setCvData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cvParam = searchParams.get("cv");
    if (cvParam && cvParam !== "null") {
      try {
        setCvData(JSON.parse(decodeURIComponent(cvParam)));
      } catch (error) {
        console.error("Failed to parse CV data:", error);
      }
    }
    setLoading(false);
  }, [searchParams]);

  const handleDownload = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My CV",
          text: "Check out my professional CV",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Failed to share:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard/builder" className="flex items-center gap-2 text-gray-600 hover:text-black transition">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Builder</span>
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
            >
              <Share2 size={18} />
              Share
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>
      </header>

      {/* CV Preview */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-12">
          {cvData ? (
            <div className="space-y-8">
              {/* Header */}
              <div className="border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-900">{cvData.name || "Your Name"}</h1>
                <p className="text-lg text-gray-600 mt-2">{cvData.email || "email@example.com"}</p>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills?.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {skill}
                    </span>
                  )) || <p className="text-gray-500">No skills added</p>}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
                <div className="space-y-4">
                  {cvData.experience?.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-600 text-sm">{exp.company}</p>
                      <p className="text-gray-500 text-xs mt-1">{exp.startDate} - {exp.endDate}</p>
                    </div>
                  )) || <p className="text-gray-500">No experience added</p>}
                </div>
              </div>

              {/* Education */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
                <div className="space-y-4">
                  {cvData.education?.map((edu: any, index: number) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600 text-sm">{edu.university}</p>
                      <p className="text-gray-500 text-xs mt-1">{edu.graduationYear}</p>
                    </div>
                  )) || <p className="text-gray-500">No education added</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No CV data to preview</p>
              <Link href="/dashboard/builder" className="inline-block mt-4 text-black font-medium hover:underline">
                Create your CV
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
