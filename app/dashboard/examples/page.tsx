"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Filter, Download, Eye, Star, TrendingUp, Library } from "lucide-react";
import { useAnalytics } from "@/lib/analytics";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { CV_SAMPLE_CATEGORIES } from "@/lib/cv-samples-catalog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Template {
  id: number;
  slug?: string;
  title: string;
  category: string;
  style: string;
  color: string;
  colors?: string[];
  description: string;
  tag?: string;
  features: string[];
  imageUrl: string;
  views: number;
  downloads: number;
  rating: number;
  atsReady?: boolean;
}

const categories = ["All", ...CV_SAMPLE_CATEGORIES];

export default function ExamplesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const PAGE_SIZE = 24;
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalViews: 0,
    totalDownloads: 0,
    avgRating: "0.0",
  });
  const analytics = useAnalytics();

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (selectedCategory !== "All") params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/templates?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Templates request failed (${response.status})`);
      }
      const data = await response.json();
      const items: Template[] = Array.isArray(data.templates) ? data.templates : [];
      setTemplates(items);
      setCatalogTotal(data.catalogTotal ?? data.total ?? items.length);
      setTotalPages(data.totalPages ?? 1);

      if (searchQuery) {
        analytics.trackSearch(searchQuery, items.length);
      }

      if (items.length === 0) {
        setStats({ totalTemplates: 0, totalViews: 0, totalDownloads: 0, avgRating: "0.0" });
      } else {
        const totalViews = items.reduce((sum, t) => sum + (t.views || 0), 0);
        const totalDownloads = items.reduce((sum, t) => sum + (t.downloads || 0), 0);
        const ratingSum = items.reduce((sum, t) => sum + (t.rating || 0), 0);
        const avg = ratingSum / items.length;
        setStats({
          totalTemplates: data.catalogTotal ?? data.total ?? items.length,
          totalViews,
          totalDownloads,
          avgRating: Number.isFinite(avg) ? avg.toFixed(1) : "0.0",
        });
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      analytics.trackError(err as Error, 'fetchTemplates');
      setTemplates([]);
      setError(err instanceof Error ? err.message : 'Could not load templates');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, page, analytics]);

  useEffect(() => {
    analytics.trackPageView('/dashboard/examples');
    analytics.trackSessionStart();
    return () => {
      analytics.trackSessionEnd();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  // Debounce filter/search so we don't refetch on every keystroke.
  useEffect(() => {
    const delay = searchQuery ? 300 : 0;
    const t = setTimeout(() => {
      fetchTemplates();
    }, delay);
    return () => clearTimeout(t);
  }, [fetchTemplates, reloadKey, searchQuery, page]);

  const trackTemplateAction = async (templateId: number, action: 'view' | 'download' | 'select') => {
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, action })
      });
      
      // Refresh templates to get updated stats
      fetchTemplates();
    } catch (error) {
      console.error('Error tracking action:', error);
    }
  };

  const handleTemplateView = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      analytics.trackTemplateView(templateId, template.title, template.category);
    }
    trackTemplateAction(templateId, 'view');
  };

  const handleTemplateDownload = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      analytics.trackTemplateDownload(templateId, template.title, template.category);
    }
    trackTemplateAction(templateId, 'download');
  };

  const handleTemplateSelect = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      analytics.trackTemplateSelect(templateId, template.title, template.category);
    }
    trackTemplateAction(templateId, 'select');
    router.push(`/dashboard/builder?templateId=${templateId}`);
  };

  const handleAIRecommendation = async () => {
    // Simulate AI recommendation based on user's profile
    const recommendations = [
      "Based on current job market trends, I recommend the 'Modern Professional' template - it has a 94% ATS success rate",
      "For your profile, the 'Tech Professional' template would highlight your skills effectively",
      "The 'Creative Designer' template is trending in 2024 with a 40% higher response rate",
      "Considering your experience level, the 'Executive Classic' template positions you optimally",
      "The 'Startup Founder' template is perfect for entrepreneurial roles with its innovative design",
      "For data-driven roles, the 'Data Scientist' template showcases your analytical skills best"
    ];
    const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
    setAiRecommendation(recommendation);
    analytics.trackAIRecommendation(recommendation);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-gray-900 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">CV Nümunə Kataloqu</h1>
            <p className="text-gray-300 text-lg">
              {catalogTotal > 0 ? `${catalogTotal.toLocaleString()}+` : "1000+"} peşəkar CV
              nümunəsi — ATS uyğun, HR tərəfindən təsdiqlənmiş şablonlar
            </p>
          </div>
          <button
            onClick={() => {
              analytics.trackButtonClick('AI Recommend', 'ai-recommend-btn', '/dashboard/examples');
              handleAIRecommendation();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            <Sparkles size={20} />
            AI Recommend
          </button>
        </div>
        {aiRecommendation && (
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="text-yellow-400 mt-1" />
              <p className="text-white">{aiRecommendation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <Filter size={18} className="text-gray-600" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                analytics.trackFilterChange('category', category);
              }}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalTemplates.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">CV Nümunələri</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalViews.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total Views</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
              <Download size={24} className="text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalDownloads.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total Downloads</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
              <Star size={24} className="text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.avgRating}</p>
              <p className="text-sm text-gray-500 mt-1">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <LoadingState label="Loading templates…" />
      ) : error ? (
        <ErrorState
          title="Couldn't load templates"
          description={error}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template: Template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all group"
            >
              {/* Preview Area with Real Image */}
              <div 
                className="aspect-[3/4] relative overflow-hidden cursor-pointer"
                onClick={() => handleTemplateView(template.id)}
              >
                <img 
                  src={template.imageUrl} 
                  alt={template.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=500&fit=crop';
                  }}
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleTemplateView(template.id); }}
                    className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                    title="View Template"
                  >
                    <Eye size={20} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleTemplateDownload(template.id); }}
                    className="p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform"
                    title="Download Template"
                  >
                    <Download size={20} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleTemplateSelect(template.id); }}
                    className="p-3 bg-green-600 text-white rounded-full hover:scale-110 transition-transform"
                    title="Use This Template"
                  >
                    <Sparkles size={20} />
                  </button>
                </div>
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                    {template.category}
                  </span>
                </div>
                {/* Popular Badge */}
                {template.views > 1500 && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      <Star size={12} />
                      Popular
                    </span>
                  </div>
                )}
                {/* Rating Badge */}
                <div className="absolute bottom-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-black text-xs font-semibold rounded-full flex items-center gap-1">
                    <Star size={12} className="fill-yellow-500 text-yellow-500" />
                    {template.rating}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {template.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Download size={12} />
                    {template.downloads.toLocaleString()} downloads
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && !error && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Əvvəlki
          </button>
          <span className="text-sm text-gray-600">
            Səhifə {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Növbəti <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && templates.length === 0 && (
        <EmptyState
          icon={Library}
          title="No templates match your filters"
          description="Try a different category or clear your search to see all available templates."
          action={
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="rounded-xl bg-black px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-800"
            >
              Clear filters
            </button>
          }
        />
      )}

      {/* AI Feature Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Sparkles size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">AI-Powered Template Selection</h3>
            <p className="text-blue-100 mb-4">
              Our AI analyzes job descriptions, industry trends, and your profile to recommend the perfect template. 
              Get personalized suggestions based on real hiring data and ATS optimization.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                ✓ ATS Optimization
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                ✓ Industry Matching
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                ✓ Real-time Analytics
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                ✓ Success Prediction
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
