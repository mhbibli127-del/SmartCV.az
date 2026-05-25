"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import ExampleProfileCard from "@/components/examples/ExampleProfileCard";
import ExamplePreviewModal from "@/components/examples/ExamplePreviewModal";
import type { CVExampleProfile } from "@/lib/cv-examples/types";
import { PageShell, PageHeader, StatCard, Surface } from "@/components/ui/page-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/lib/analytics";

const PAGE_SIZE = 24;

export default function ExamplesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trackPageView, trackSearch, trackTemplateSelect } = useAnalytics();
  const [examples, setExamples] = useState<CVExampleProfile[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [preview, setPreview] = useState<CVExampleProfile | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    trackPageView("/dashboard/examples");
  }, [trackPageView]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
      setDebouncedQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery.trim()) trackSearch(searchQuery.trim(), catalogTotal);
    }, 280);
    return () => clearTimeout(t);
  }, [searchQuery, catalogTotal, trackSearch]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, debouncedQuery]);

  const fetchExamples = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (debouncedQuery) params.set("q", debouncedQuery);

      const res = await fetch(`/api/examples?${params}`);
      const data = await res.json();
      setExamples(Array.isArray(data.examples) ? data.examples : []);
      setCatalogTotal(data.catalogTotal ?? data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      if (Array.isArray(data.categories)) setCategories(data.categories);
    } catch {
      setExamples([]);
      setError("We couldn't load examples right now. Your filters are saved — try again.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, debouncedQuery]);

  useEffect(() => {
    fetchExamples();
  }, [fetchExamples, reloadKey]);

  const handleUseExample = (example: CVExampleProfile) => {
    trackTemplateSelect(parseInt(example.id.replace(/\D/g, ""), 10) || 0, example.name, example.category);
    sessionStorage.setItem(
      "smartcv_import_example",
      JSON.stringify({ cvContent: example.cvContent, template: example.template, name: example.name })
    );
    router.push(`/dashboard/builder?example=${example.slug}&template=${example.template}`);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Design gallery"
        title="Professional CV examples"
        description={`Browse ${catalogTotal > 0 ? catalogTotal.toLocaleString() : "88"}+ realistic profiles — ATS-optimized and ready to customize.`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Profiles" value={catalogTotal.toLocaleString()} />
        <StatCard label="Categories" value={String(Math.max(0, categories.length - 1))} />
        <StatCard label="On this page" value={String(examples.length)} />
        <StatCard
          label="Filter"
          value={debouncedQuery ? "Search" : "All"}
          hint={debouncedQuery ? `"${debouncedQuery.slice(0, 20)}${debouncedQuery.length > 20 ? "…" : ""}"` : undefined}
        />
      </div>

      <Surface padding>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="search"
              placeholder="Search by name, role, skill, location…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {loading && debouncedQuery && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                Searching…
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 shrink-0 text-zinc-400" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                  selectedCategory === cat
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "bg-zinc-50 text-zinc-600 ring-1 ring-black/[0.06] hover:bg-zinc-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Surface>

      {loading && examples.length === 0 ? (
        <LoadingState label="Loading professional examples…" />
      ) : error ? (
        <ErrorState description={error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : examples.length === 0 ? (
        <EmptyState
          title="No profiles match your search"
          description="Try a different keyword or category — our database has examples across every major role."
          action={
            <Button
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {examples.map((ex) => (
            <ExampleProfileCard
              key={ex.id}
              example={ex}
              onPreview={setPreview}
              onUse={handleUseExample}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-sm tabular-nums text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ExamplePreviewModal
        example={preview}
        onClose={() => setPreview(null)}
        onUse={(ex) => {
          setPreview(null);
          handleUseExample(ex);
        }}
      />
    </PageShell>
  );
}
