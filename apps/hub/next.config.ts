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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "nobrainnogame.ghom.fr", pathname: "/covers/**" },
    ],
  },
  turbopack: { root },
  // ghom.fr/api/* est servi par l'API (dépôt GhomKrosmonaute/ghom-api, NestJS sur api.ghom.fr).
  // « afterFiles » : les routes statiques du hub (/api/revalidate) gardent la priorité, mais la
  // réécriture passe avant les routes dynamiques ([lang] capterait sinon /api/…).
  async rewrites() {
    const api = process.env.API_ORIGIN ?? "https://api.ghom.fr";
    return {
      beforeFiles: [],
      afterFiles: [{ source: "/api/:path*", destination: `${api}/:path*` }],
      fallback: [],
    };
  },
};

export default config;
