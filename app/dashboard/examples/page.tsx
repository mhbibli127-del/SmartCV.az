"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Plus, Sparkles } from "lucide-react";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { PageShell, PageHeader, Surface } from "@/components/ui/page-shell";
import { Input } from "@/components/ui/input";
import { PublishedResumeCard } from "@/components/examples/PublishedResumeCard";
import { PublishedResumePreviewModal } from "@/components/examples/PublishedResumePreviewModal";
import type { PublishedResumeItem, ResumeContent } from "@/types/resume";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

export default function ExamplesPage() {
  const searchParams = useSearchParams();
  const [resumes, setResumes] = useState<PublishedResumeItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<
    (PublishedResumeItem & { content?: ResumeContent }) | null
  >(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 280);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchPublished = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (debouncedQuery) params.set("q", debouncedQuery);

      const res = await fetch(`/api/examples?${params}`);
      const data = await res.json();
      setResumes(Array.isArray(data.resumes) ? data.resumes : []);
      if (Array.isArray(data.categories)) setCategories(data.categories);
    } catch {
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedQuery]);

  useEffect(() => {
    void fetchPublished();
  }, [fetchPublished]);

  useEffect(() => {
    const onFocus = () => void fetchPublished();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchPublished]);

  const handlePreview = async (item: PublishedResumeItem) => {
    try {
      const res = await fetch(`/api/examples/${item.id}`);
      if (res.ok) {
        const data = await res.json();
        setPreview(data.resume ?? item);
      } else {
        setPreview(item);
      }
    } catch {
      setPreview(item);
    }
  };

  const showEmpty = !loading && resumes.length === 0 && !debouncedQuery && selectedCategory === "All";

  return (
    <PageShell>
      <PageHeader
        eyebrow="Community gallery"
        title="Published resumes"
        description="Real resumes shared by SmartCV users after PDF export from Studio."
        action={
          <Link
            href="/dashboard/studio"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Sparkles className="h-4 w-4" />
            Open Studio
          </Link>
        }
      />

      {!showEmpty && (
        <Surface padding>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search by template name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                    selectedCategory === cat
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Surface>
      )}

      {loading ? (
        <LoadingState label="Loading community resumes…" />
      ) : showEmpty ? (
        <EmptyState
          title="No resumes published yet"
          description="Export a PDF from Studio to share your resume in the community gallery."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <Sparkles className="h-4 w-4" />
                Open Studio
              </Link>
              <Link
                href="/dashboard/templates"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <Plus className="h-4 w-4" />
                Browse templates
              </Link>
            </div>
          }
          className="border-zinc-200 bg-white py-16"
        />
      ) : resumes.length === 0 ? (
        <EmptyState
          title="No matches found"
          description="Try another template category or search term."
          action={
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Clear filters
            </button>
          }
          className="border-zinc-200 bg-white py-16"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resumes.map((resume) => (
            <PublishedResumeCard
              key={resume.id}
              resume={resume}
              onPreview={handlePreview}
            />
          ))}
        </div>
      )}

      <PublishedResumePreviewModal resume={preview} onClose={() => setPreview(null)} />
    </PageShell>
  );
}
