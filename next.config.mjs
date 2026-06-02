import { withSentryConfig } from "@sentry/nextjs";
import "./scripts/load-env.mjs";

/** Release name — must match runtime `release` in lib/sentry/options.ts */
function getBuildRelease() {
  return (
    process.env.SENTRY_RELEASE?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    (process.env.npm_package_version
      ? `smartcv-az@${process.env.npm_package_version}`
      : undefined)
  );
}

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN?.trim();
const sentryRelease = getBuildRelease();
const uploadSourceMaps = Boolean(sentryAuthToken);
const isCi = Boolean(process.env.CI);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
      process.env.CLOUDINARY_CLOUD_NAME ??
      "",
    NEXT_PUBLIC_SENTRY_DSN:
      process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() ||
      process.env.SENTRY_DSN?.trim() ||
      "",
    NEXT_PUBLIC_SENTRY_RELEASE: sentryRelease ?? "",
    NEXT_PUBLIC_VERCEL_ENV:
      process.env.NEXT_PUBLIC_VERCEL_ENV?.trim() ||
      process.env.VERCEL_ENV?.trim() ||
      "",
  },
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/google750ae19981486b4c.html",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      "@prisma/client",
      "prisma",
      "puppeteer-core",
      "@sparticuz/chromium",
      "pdf-parse",
      "cloudinary",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"];
    }
    return config;
  },
};

const sentryBuildOptions = {
  org: process.env.SENTRY_ORG?.trim() || "smartcv-99",
  project: process.env.SENTRY_PROJECT?.trim() || "javascript-nextjs",
  authToken: sentryAuthToken,
  ...(sentryRelease ? { release: { name: sentryRelease } } : {}),
  // Suppress "No auth token" / sourcemap upload noise when SENTRY_AUTH_TOKEN is unset
  silent: !uploadSourceMaps,
  widenClientFileUpload: uploadSourceMaps,
  hideSourceMaps: true,
  // Tunnel only in production — local dev proxy often fails (POST /monitoring 500)
  tunnelRoute:
    process.env.NODE_ENV === "production" && process.env.SENTRY_DSN?.trim()
      ? "/monitoring"
      : undefined,
  ...(uploadSourceMaps
    ? {
        sourcemaps: {
          deleteSourcemapsAfterUpload: true,
        },
      }
    : {
        sourcemaps: {
          disable: true,
        },
      }),
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

export default withSentryConfig(nextConfig, sentryBuildOptions);
