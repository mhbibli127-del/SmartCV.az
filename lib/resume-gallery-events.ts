export const RESUME_GALLERY_EVENT = "smartcv:resume-gallery-updated";

export type ResumeGalleryEventDetail = {
  resumeId?: string;
};

export function dispatchResumeGalleryUpdate(detail?: ResumeGalleryEventDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(RESUME_GALLERY_EVENT, { detail }));
}
