import type { Project } from "../types";

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    slug: "demo",
    name: "Demo",
    tagline: "Une démo",
    description: "Description de démo",
    owner: "PERSONAL",
    kind: "WEB_APP",
    status: "LIVE",
    subdomain: null,
    externalUrl: null,
    repoUrl: null,
    coverUrl: null,
    accent: "#00f0ff",
    tags: [],
    stack: [],
    featured: false,
    playable: false,
    sortOrder: 0,
    year: 2026,
    genre: null,
    platforms: [],
    players: null,
    ...overrides,
  };
}
