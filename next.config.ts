import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  return {
    reactStrictMode: true,
    // Keep development and production artifacts separate. Running `next build`
    // while the local preview is open can otherwise invalidate dev chunks.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    images: { formats: ["image/avif", "image/webp"] },
  };
}
