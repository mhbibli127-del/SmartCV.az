/** Media upload contexts for SmartCV.AZ */
export type MediaContext =
  | "avatar"
  | "resume"
  | "portfolio"
  | "template-preview"
  | "export";

export interface MediaUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  context: MediaContext;
  optimizedUrl: string;
}

export interface MediaDeleteResult {
  publicId: string;
  result: string;
}

export interface MediaUploadError {
  error: string;
  code?: string;
}
