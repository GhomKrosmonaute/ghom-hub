import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GHOM — Full-stack & game developer",
    short_name: "GHOM",
    start_url: "/",
    display: "standalone",
    background_color: "#020204",
    theme_color: "#020204",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
