import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home directory makes Turbopack infer the
  // workspace root as C:\Users\<user>; pin it to this project instead.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  // The dev badge overlaps the hero CTAs and pollutes comparison screenshots.
  devIndicators: false,
  // The mirrored original site lives in _reference/ and must never be bundled.
  outputFileTracingExcludes: {
    "*": ["./_reference/**/*"],
  },
  async redirects() {
    return [
      { source: "/work", destination: "/games", permanent: false },
      { source: "/about", destination: "/#home", permanent: false },
      { source: "/contact", destination: "/#contact", permanent: false },
      { source: "/es", destination: "/", permanent: false },
      { source: "/es/:path*", destination: "/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
