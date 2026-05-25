import type { Config } from "tailwindcss";

/**
 * Tailwind v4 uses CSS-first config (@import "tailwindcss" in globals.css).
 * This file is kept for tooling compatibility and legacy @config references.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
