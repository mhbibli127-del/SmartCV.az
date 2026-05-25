/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      "@prisma/client",
      "prisma",
      "puppeteer-core",
      "@sparticuz/chromium",
      "pdf-parse",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
  webpack: (config, { isServer }) => {
    // Konva's node build optionally requires the native `canvas` package — not used in browser.
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

export default nextConfig;
