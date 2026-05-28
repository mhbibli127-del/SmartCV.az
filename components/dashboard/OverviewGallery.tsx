"use client";

import { memo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import type { ResumeListItem } from "@/types/resume";
import { ResumeCard } from "@/components/resumes/ResumeCard";
import { DeleteResumeModal } from "@/components/resumes/DeleteResumeModal";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { PageShell, PageHeader } from "@/components/ui/page-shell";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { RESUME_GALLERY_EVENT } from "@/lib/resume-gallery-events";
import { PdfImportDropzone } from "@/components/pdf/PdfImportDropzone";
import { storeExtractedPdfData } from "@/lib/pdf/client-upload";
import type { PdfImportPayload } from "@/types/pdf-import";

interface OverviewGalleryProps {
  initialResumes: ResumeListItem[];
  userName?: string | null;
}

function OverviewGalleryInner({ initialResumes, userName }: OverviewGalleryProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResumeListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { success, error: toastError } = useToast();
  const { user, loading: userLoading } = useCurrentUser();

  const greeting = userLoading
    ? "there"
    : (user?.name ?? userName ?? "there").split(" ")[0];

  const refreshResumes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resumes", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setResumes(Array.isArray(data.resumes) ? data.resumes : []);
    } catch {
      /* keep current list */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setResumes(initialResumes);
  }, [initialResumes]);

  useEffect(() => {
    const onUpdate = () => void refreshResumes();
    window.addEventListener(RESUME_GALLERY_EVENT, onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      window.removeEventListener(RESUME_GALLERY_EVENT, onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [refreshResumes]);

  const handleDuplicate = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        const res = await fetch(`/api/resumes/${id}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "duplicate" }),
        });
        if (!res.ok) throw new Error("Duplicate failed");
        const data = await res.json();
        if (data.resume) {
          setResumes((prev) => [mapResume(data.resume), ...prev]);
          success("Duplicated", "A copy was added to your workspace.");
        }
      } catch {
        toastError("Duplicate failed", "Please try again.");
      } finally {
        setBusyId(null);
      }
    },
    [success, toastError]
  );

  const handlePublish = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        const res = await fetch(`/api/resumes/${id}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "publish" }),
        });
        if (!res.ok) throw new Error("Publish failed");
        const data = await res.json();
        if (data.resume) {
          setResumes((prev) =>
            prev.map((r) => (r.id === id ? { ...r, isPublished: true } : r))
          );
          success("Published", "Resume is visible in Examples.");
        }
      } catch {
        toastError("Publish failed", "Please try again.");
      } finally {
        setBusyId(null);
      }
    },
    [success, toastError]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/resumes/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      success("Deleted", "Resume removed from your workspace.");
      setDeleteTarget(null);
    } catch {
      toastError("Delete failed", "Please try again.");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, success, toastError]);

  const handlePdfImported = useCallback(
    (data: PdfImportPayload) => {
      storeExtractedPdfData(data);
      if (data.success || data.fullName || data.rawExperience) {
        success("PDF imported", "Opening AI generator with your details…");
      } else {
        toastError("Partial import", data.message || "Some fields could not be read.");
      }
      router.push("/dashboard/generator");
    },
    [router, success, toastError]
  );

  const showEmpty = !loading && resumes.length === 0;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Workspace"
        title={`Good to see you, ${greeting}`}
        description="Your resumes — create, edit, and export from one place."
        action={
          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            Create Resume
          </Link>
        }
      />

      {loading && resumes.length === 0 ? (
        <LoadingState label="Loading your resumes…" />
      ) : showEmpty ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Start from a template or import an existing PDF to pre-fill your CV."
          action={
            <div className="flex w-full max-w-md flex-col gap-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard/templates")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Create Resume
              </button>
              <PdfImportDropzone
                compact
                label="Import from PDF"
                onImported={handlePdfImported}
                onError={(msg) => toastError("Import failed", msg)}
              />
            </div>
          }
          className="border-zinc-200 bg-white py-20"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDuplicate={handleDuplicate}
              onDelete={setDeleteTarget}
              onPublish={handlePublish}
              busy={busyId === resume.id}
            />
          ))}
        </div>
      )}

      <DeleteResumeModal
        resume={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </PageShell>
  );
}

function mapResume(r: Record<string, unknown>): ResumeListItem {
  return {
    id: String(r.id),
    title: String(r.title ?? "Untitled"),
    templateId: String(r.templateId ?? ""),
    templateName: (r.templateName as string | null) ?? null,
    thumbnail: String(r.thumbnail ?? ""),
    pdfUrl: String(r.pdfUrl ?? ""),
    atsScore: (r.atsScore as number | null) ?? null,
    isPublished: Boolean(r.isPublished),
    createdAt: String(r.createdAt ?? new Date().toISOString()),
    updatedAt: String(r.updatedAt ?? new Date().toISOString()),
  };
}

export const OverviewGallery = memo(OverviewGalleryInner);
