"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Copy,
  Download,
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import type { ResumeListItem } from "@/types/resume";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ResumeCardProps {
  resume: ResumeListItem;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (resume: ResumeListItem) => void;
  onPublish: (id: string) => Promise<void>;
  busy?: boolean;
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Updated today";
  if (diffDays === 1) return "Updated yesterday";
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function ResumeCardInner({
  resume,
  onDuplicate,
  onDelete,
  onPublish,
  busy,
}: ResumeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const editHref = `/dashboard/studio?id=${resume.id}`;

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const handleDownload = useCallback(() => {
    if (!resume.pdfUrl) return;
    const a = document.createElement("a");
    a.href = resume.pdfUrl;
    a.download = `${resume.title.replace(/\s+/g, "_")}.pdf`;
    a.click();
    setMenuOpen(false);
  }, [resume.pdfUrl, resume.title]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-shadow hover:border-zinc-300 hover:shadow-lg"
    >
      <Link href={editHref} className="relative block overflow-hidden bg-zinc-100">
        {resume.thumbnail ? (
          <div className="relative aspect-[210/297] w-full">
            <Image
              src={resume.thumbnail}
              alt={resume.title}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
        ) : (
          <div className="flex aspect-[210/297] flex-col items-center justify-center gap-2 bg-zinc-100 text-zinc-400">
            <Pencil className="h-8 w-8 opacity-40" />
            <span className="text-xs">Preview after export</span>
          </div>
        )}

        {resume.isPublished && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            <Globe className="h-3 w-3" />
            Published
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-zinc-900">{resume.title}</h3>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {resume.templateName ?? "Custom template"}
          </p>
          <p className="mt-1 text-[11px] text-zinc-400" suppressHydrationWarning>
            {formatUpdatedAt(resume.updatedAt)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          {resume.atsScore != null ? (
            <Badge variant={resume.atsScore >= 80 ? "success" : "secondary"}>
              ATS {resume.atsScore}%
            </Badge>
          ) : (
            <Badge variant="outline">Draft</Badge>
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              disabled={busy}
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900",
                menuOpen && "bg-zinc-100 text-zinc-900"
              )}
              aria-label="Resume actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute bottom-full right-0 z-20 mb-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl"
                >
                  <MenuLink
                    href={editHref}
                    icon={Pencil}
                    label="Edit"
                    onClick={() => setMenuOpen(false)}
                  />
                  <MenuButton
                    icon={Copy}
                    label="Duplicate"
                    onClick={() => {
                      setMenuOpen(false);
                      void onDuplicate(resume.id);
                    }}
                  />
                  {resume.pdfUrl && (
                    <MenuButton icon={Download} label="Download PDF" onClick={handleDownload} />
                  )}
                  {!resume.isPublished && (
                    <MenuButton
                      icon={Globe}
                      label="Publish"
                      onClick={() => {
                        setMenuOpen(false);
                        void onPublish(resume.id);
                      }}
                    />
                  )}
                  <div className="my-1 border-t border-zinc-100" />
                  <MenuButton
                    icon={Trash2}
                    label="Delete"
                    destructive
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(resume);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Link
          href={editHref}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 hover:bg-zinc-800"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit resume
        </Link>
      </div>
    </motion.article>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
    >
      <Icon className="h-4 w-4 text-zinc-400" />
      {label}
    </Link>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50",
        destructive ? "text-red-600" : "text-zinc-700"
      )}
    >
      <Icon className={cn("h-4 w-4", destructive ? "text-red-500" : "text-zinc-400")} />
      {label}
    </button>
  );
}

export const ResumeCard = memo(ResumeCardInner, (prev, next) => {
  if (prev.busy !== next.busy) return false;
  if (prev.resume.id !== next.resume.id) return false;
  return (
    prev.resume.updatedAt === next.resume.updatedAt &&
    prev.resume.title === next.resume.title &&
    prev.resume.thumbnail === next.resume.thumbnail &&
    prev.resume.isPublished === next.resume.isPublished &&
    prev.resume.pdfUrl === next.resume.pdfUrl &&
    prev.resume.atsScore === next.resume.atsScore
  );
});
