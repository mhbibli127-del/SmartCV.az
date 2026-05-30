import type { Metadata } from "next";

const SITE_NAME = "SmartCV.AZ";
const DEFAULT_DESCRIPTION =
  "Professional CV builder with templates, visual Studio editor, and PDF export for Azerbaijan and beyond.";
const DEFAULT_OG_IMAGE = "/brand/logo-mark.svg";

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const url = path ? `https://smartcv.az${path.startsWith("/") ? path : `/${path}`}` : "https://smartcv.az";

  return {
    title: fullTitle,
    description,
    metadataBase: new URL("https://smartcv.az"),
    alternates: path ? { canonical: url } : undefined,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "az_AZ",
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export const rootMetadata: Metadata = {
  ...createPageMetadata({
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  }),
  icons: {
    icon: [{ url: "/brand/logo-mark.svg", type: "image/svg+xml" }],
    apple: "/brand/logo-mark.svg",
  },
};
