import path from "node:path";
import type { NextConfig } from "next";

const root = path.resolve(process.cwd(), "../..");

// Le .env est partagé à la racine du monorepo : il est chargé par `bun --env-file` (cf. package.json).
const config: NextConfig = {
  // Image Docker autonome ; sur Vercel, le build natif de la plateforme est utilisé.
  output: process.env.VERCEL ? undefined : "standalone",
  outputFileTracingRoot: root,
  transpilePackages: ["@ghom/ui", "@ghom/core", "@ghom/content", "@ghom/db"],
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root },
};

export default config;
