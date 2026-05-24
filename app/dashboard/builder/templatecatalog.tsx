'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutGrid,
  Check,
  ArrowRight,
  ShieldCheck,
  Star,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CV_SAMPLE_CATEGORIES } from '@/lib/cv-samples-catalog';

interface TemplateItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  style: string;
  color: string;
  colors: string[];
  description: string;
  tag: string;
  features: string[];
  rating: number;
  atsReady?: boolean;
}

interface CatalogProps {
  onSelect: (templateId: string, color: string) => void;
}

const PAGE_SIZE = 12;

export default function TemplateCatalog({ onSelect }: CatalogProps) {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState('#111827');

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (category !== 'All') params.set('category', category);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/templates?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load templates');
      const data = await res.json();
      const items: TemplateItem[] = Array.isArray(data.templates) ? data.templates : [];
      setTemplates(items);
      setTotal(data.catalogTotal ?? data.total ?? items.length);
      setTotalPages(data.totalPages ?? 1);
      if (items.length > 0) {
        setSelectedTemplate((prev) => {
          if (prev !== null && items.some((t) => t.id === prev)) return prev;
          return items[0].id;
        });
        setSelectedColor((prev) => prev || (items[0].colors?.[0] ?? items[0].color));
      }
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => {
    const t = setTimeout(fetchTemplates, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchTemplates, search]);

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedTemplate) ?? templates[0],
    [templates, selectedTemplate]
  );

  return (
    <div className="space-y-10">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <LayoutGrid size={12} />
          <span>Addım 1: Vizual Stil</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Dünya Standartlarında{' '}
          <span className="text-slate-400 font-medium">CV Nümunələri</span>
        </h2>
        <p className="text-slate-500 text-sm">
          {total.toLocaleString()}+ peşəkar CV nümunəsi arasından seçin. ATS sistemləri
          üçün optimallaşdırılmış, HR tərəfindən təsdiqlənmiş şablonlar.
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-5xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Peşə, kateqoriya və ya stil axtar..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...CV_SAMPLE_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                category === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-12">
          Axtarışınıza uyğun nümunə tapılmadı.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            const colors = template.colors?.length ? template.colors : [template.color];
            return (
              <div
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setSelectedColor(colors[0]);
                }}
                className={`relative bg-white border rounded-3xl p-5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 ring-1 ring-slate-900 shadow-xl'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center border-2 border-white">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 px-2 py-1 rounded text-slate-700">
                      {template.tag}
                    </span>
                    <div className="flex items-center space-x-1 text-amber-500 text-xs font-semibold">
                      <Star size={12} className="fill-amber-500" />
                      <span>{template.rating}</span>
                    </div>
                  </div>

                  <div className="w-full h-36 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden flex flex-col p-4 space-y-2">
                    <div
                      className="h-3 rounded w-1/3"
                      style={{ backgroundColor: isSelected ? selectedColor : colors[0] }}
                    />
                    <div className="h-2 bg-slate-200 rounded w-2/3" />
                    <div className="h-2 bg-slate-100 rounded w-full" />
                    <div className="h-2 bg-slate-100 rounded w-4/5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      {template.category} · {template.style}
                    </p>
                    <h3 className="font-bold text-sm text-slate-950 mt-1">{template.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-1.5">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setSelectedColor(color);
                        }}
                        className={`w-5 h-5 rounded-full border transition-all ${
                          isSelected && selectedColor === color
                            ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                            : 'opacity-60'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <ShieldCheck size={12} /> ATS-Ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Əvvəlki
          </button>
          <span className="text-sm text-slate-600">
            Səhifə {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
          >
            Növbəti <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && onSelect(String(selected.id), selectedColor)}
          className="group inline-flex items-center justify-center space-x-2 bg-slate-900 text-white font-medium px-8 py-4 rounded-xl shadow-md hover:bg-slate-800 transition-all text-sm disabled:opacity-50"
        >
          <span>Dizaynı Təsdiqlə və Məlumatlara Keç</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
