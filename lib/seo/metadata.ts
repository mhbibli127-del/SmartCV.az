import type { Metadata } from "next";

const SITE_NAME = "SmartCV.AZ";
const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://smartcv.vercel.app";
const ROOT_TITLE = "SmartCV – AI CV Builder by Murad Habibli";
const DEFAULT_DESCRIPTION =
  "Create professional CVs instantly using AI. SmartCV is a fast and modern resume builder.";
const DEFAULT_OG_IMAGE = "/brand/logo-mark.svg";
const GOOGLE_SITE_VERIFICATION = "google750ae19981486b4c";

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
  const url = path
    ? `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
    : SITE_URL;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
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
  title: ROOT_TITLE,
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: ROOT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: ROOT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: [{ url: "/brand/logo-mark.svg", type: "image/svg+xml" }],
    apple: "/brand/logo-mark.svg",
  },
};
