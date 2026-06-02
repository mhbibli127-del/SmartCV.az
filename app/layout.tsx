import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AppProviders } from "@/app/providers";
import { inter, studioFontVariables } from "@/lib/fonts";
import { rootMetadata } from "@/lib/seo/metadata";

/** Root SEO + Google Search Console (meta tag + /public + route backup). */
export const metadata: Metadata = {
  ...rootMetadata,
  verification: {
    ...(typeof rootMetadata.verification === "object" && rootMetadata.verification !== null
      ? rootMetadata.verification
      : {}),
    google: "google750ae19981486b4c",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="az" className={`${inter.variable} ${studioFontVariables}`}>
      <body className={inter.className}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
