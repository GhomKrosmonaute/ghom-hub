import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://ghom.fr/sitemap.xml",
    host: "https://ghom.fr",
  };
}
