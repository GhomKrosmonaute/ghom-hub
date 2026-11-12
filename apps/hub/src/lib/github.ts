/**
 * Télémétrie GitHub du pilote : calendrier de contributions (page publique) et compteurs (API REST).
 * Mis en cache une heure ; renvoie `null` si GitHub ne répond pas, et l'encart n'est alors pas affiché.
 * `GITHUB_TOKEN` (facultatif) évite la limite de 60 requêtes/heure de l'API anonyme.
 */
export const GITHUB_USER = "GhomKrosmonaute";

export type ContributionDay = { date: string; level: number; count: number };
export type GithubTelemetry = {
  total: number;
  days: ContributionDay[];
  repos: number | null;
  stars: number | null;
  followers: number | null;
};

const CACHE = { next: { revalidate: 3600 } };

/** Extrait les jours du calendrier HTML de GitHub (cellules `data-date` + infobulles). */
export function parseContributions(html: string): { total: number; days: ContributionDay[] } {
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/for="(contribution-day-component-[\d-]+)"[^>]*>([^<]*)/g)) {
    const n = /^(\d+) contributions?/.exec(m[2]?.trim() ?? "");
    counts.set(m[1] as string, n ? Number(n[1]) : 0);
  }
  const days: ContributionDay[] = [];
  for (const m of html.matchAll(/<td[^>]*data-date="([\d-]+)"[^>]*>/g)) {
    const td = m[0];
    const id = /id="([^"]+)"/.exec(td)?.[1] ?? "";
    const level = Number(/data-level="(\d)"/.exec(td)?.[1] ?? 0);
    days.push({ date: m[1] as string, level, count: counts.get(id) ?? 0 });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  const total = /([\d,]+)\s+contributions?\s+in the last year/.exec(html)?.[1];
  return {
    total: total ? Number(total.replace(/,/g, "")) : days.reduce((s, d) => s + d.count, 0),
    days,
  };
}

async function api<T>(path: string): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN;
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      ...CACHE,
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function getGithubTelemetry(): Promise<GithubTelemetry | null> {
  try {
    const [html, user, repos] = await Promise.all([
      fetch(`https://github.com/users/${GITHUB_USER}/contributions`, CACHE).then((r) =>
        r.ok ? r.text() : null,
      ),
      api<{ public_repos: number; followers: number }>(`/users/${GITHUB_USER}`),
      api<{ stargazers_count: number; fork: boolean }[]>(
        `/users/${GITHUB_USER}/repos?per_page=100&type=owner`,
      ),
    ]);
    if (!html) return null;
    const { total, days } = parseContributions(html);
    if (days.length === 0) return null;
    return {
      total,
      days,
      repos: user?.public_repos ?? null,
      followers: user?.followers ?? null,
      // Première page (100 dépôts les plus récents) : suffisant pour un ordre de grandeur.
      stars: repos
        ? repos.filter((r) => !r.fork).reduce((s, r) => s + r.stargazers_count, 0)
        : null,
    };
  } catch {
    return null;
  }
}
