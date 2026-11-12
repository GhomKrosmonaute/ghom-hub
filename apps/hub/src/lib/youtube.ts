import { SATANE_GHOM } from "@ghom/content";

/**
 * Statistiques publiques de la chaîne Satané Ghom, sans clé d'API :
 * compteurs lus dans la page « À propos » (bloc `aboutChannelViewModel`), dernières vidéos
 * via le flux RSS public. Mis en cache une heure ; `null` si YouTube ne répond pas.
 */
export type YoutubeVideo = { id: string; title: string; published: string; views: number | null };
export type YoutubeStats = {
  subscribers: number | null;
  views: number | null;
  videos: number | null;
  joined: string | null;
  latest: YoutubeVideo[];
};

const CACHE = { next: { revalidate: 3600 } };
const HEADERS = { "Accept-Language": "en", "User-Agent": "Mozilla/5.0 (ghom.fr)" };

/** "1,234" → 1234 ; "38.6K" → 38600 ; "1.2M" → 1200000. */
export function parseCount(text: string | undefined): number | null {
  const m = /([\d.,]+)\s*([KM])?/i.exec(text ?? "");
  if (!m) return null;
  const mult = m[2]?.toUpperCase() === "M" ? 1e6 : m[2]?.toUpperCase() === "K" ? 1e3 : 1;
  const n =
    mult === 1 ? Number(m[1]?.replace(/[.,]/g, "")) : Number(m[1]?.replace(/,/g, "")) * mult;
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** Compteurs de la chaîne, lus uniquement dans son propre bloc « À propos ». */
export function parseAbout(html: string) {
  const start = html.indexOf('aboutChannelViewModel":{');
  if (start < 0) return null;
  const block = html.slice(start, start + 6000);
  const field = (name: string) => new RegExp(`"${name}":"([^"]+)"`).exec(block)?.[1];
  const joined = /joinedDateText":\{"content":"Joined ([^"]+)"/.exec(block)?.[1] ?? null;
  return {
    subscribers: parseCount(field("subscriberCountText")),
    views: parseCount(field("viewCountText")),
    videos: parseCount(field("videoCountText")),
    joined: joined ? new Date(`${joined} UTC`).toISOString().slice(0, 10) : null,
  };
}

/** Dernières vidéos du flux RSS (titre, date, vues). */
export function parseFeed(xml: string, limit = 5): YoutubeVideo[] {
  const decode = (s: string) =>
    s
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, limit).map(([, e = ""]) => {
    const views = /<media:statistics views="(\d+)"/.exec(e)?.[1];
    return {
      id: /<yt:videoId>([^<]+)</.exec(e)?.[1] ?? "",
      title: decode(/<media:title>([^<]*)</.exec(e)?.[1] ?? ""),
      published: /<published>([^<]+)</.exec(e)?.[1] ?? "",
      views: views ? Number(views) : null,
    };
  });
}

export async function getYoutubeStats(): Promise<YoutubeStats | null> {
  try {
    const [about, feed] = await Promise.all([
      fetch(`https://www.youtube.com/channel/${SATANE_GHOM.channelId}/about`, {
        ...CACHE,
        headers: HEADERS,
      }).then((r) => (r.ok ? r.text() : "")),
      fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${SATANE_GHOM.channelId}`, {
        ...CACHE,
        headers: HEADERS,
      }).then((r) => (r.ok ? r.text() : "")),
    ]);
    const counts = parseAbout(about);
    const latest = parseFeed(feed);
    if (!counts && latest.length === 0) return null;
    return {
      subscribers: counts?.subscribers ?? null,
      views: counts?.views ?? null,
      videos: counts?.videos ?? null,
      joined: counts?.joined ?? null,
      latest,
    };
  } catch {
    return null;
  }
}
