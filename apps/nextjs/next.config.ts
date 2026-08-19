/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "@disco/env";

import type { NextConfig } from "next";

const config: NextConfig = {
  /**
   * The `@disco/*` workspace packages are published as TypeScript source, so Next.js has to
   * compile them itself.
   */
  transpilePackages: ["@disco/db", "@disco/env"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dnm1fy55wi.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default config;
