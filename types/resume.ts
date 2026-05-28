export interface ResumeContent {
  mode: "visual" | "form";
  canvas?: {
    width: number;
    height: number;
    background?: string;
    elements: unknown[];
  };
  templateSlug?: string;
  templateName?: string;
  templateId?: string;
  metadata?: {
    version: number;
    editor?: string;
  };
  [key: string]: unknown;
}

export interface ResumeRecord {
  id: string;
  userId: number;
  title: string;
  templateId: string;
  templateName: string | null;
  thumbnail: string;
  pdfUrl: string;
  content: ResumeContent;
  atsScore: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeListItem {
  id: string;
  title: string;
  templateId: string;
  templateName: string | null;
  thumbnail: string;
  pdfUrl: string;
  atsScore: number | null;
  isPublished: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface PublishedResumeItem {
  id: string;
  title: string;
  templateId: string;
  templateName: string | null;
  templateCategory: string | null;
  thumbnail: string;
  pdfUrl: string;
  createdAt: string;
}

export interface SaveResumeRequest {
  resumeId?: string;
  title: string;
  templateId: string;
  templateName?: string;
  content: ResumeContent;
  atsScore?: number;
  thumbnailDataUrl?: string;
  pdfBase64?: string;
  publish?: boolean;
}
