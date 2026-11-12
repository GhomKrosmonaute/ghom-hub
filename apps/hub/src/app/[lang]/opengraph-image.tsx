import { isLocale } from "@ghom/core";
import { ImageResponse } from "next/og";

export const alt = "GHOM — ghom.fr";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEXT = {
  fr: {
    role: "Développeur full-stack & game dev",
    line: "Applications web · Outils open source · Jeux dans le navigateur",
    studio: "Fondateur du studio No Brain No Game",
  },
  en: {
    role: "Full-stack & game developer",
    line: "Web apps · Open source tools · Browser games",
    studio: "Founder of the No Brain No Game studio",
  },
};

const CYAN = "#00f0ff";
const MAGENTA = "#ff2bd6";
const EMBLEM = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M6 4h20l2 2v8l-6 4H10L4 14V6z" fill="none" stroke="${CYAN}" stroke-width="1.2"/><path d="M9 10h5M18 10h5" stroke="${MAGENTA}" stroke-width="1.8"/><path d="M8 22h16M11 27h10" stroke="${CYAN}" stroke-width="1"/></svg>`,
).toString("base64")}`;

/** Aperçu partagé (Open Graph / réseaux sociaux) de ghom.fr. */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = TEXT[isLocale(lang) ? lang : "fr"];
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#020204",
        backgroundImage: `linear-gradient(rgba(0,240,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,.07) 1px, transparent 1px), radial-gradient(circle at 85% 30%, rgba(255,43,214,.22), transparent 45%)`,
        backgroundSize: "48px 48px, 48px 48px, 100% 100%",
        color: "#e8faff",
        border: `2px solid ${CYAN}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          color: CYAN,
          fontSize: 26,
          letterSpacing: 6,
        }}
      >
        <svg width="56" height="56" viewBox="0 0 32 32" role="img" aria-label="GHOM">
          <path d="M6 4h20l2 2v8l-6 4H10L4 14V6z" fill="none" stroke={CYAN} strokeWidth="2" />
          <path d="M9 10h5M18 10h5" stroke={MAGENTA} strokeWidth="2.5" />
          <path d="M8 22h16M11 27h10" stroke={CYAN} strokeWidth="1.5" />
        </svg>
        GHOM.FR
      </div>
      <div style={{ position: "absolute", right: 80, top: 90, display: "flex" }}>
        {/* biome-ignore lint/performance/noImgElement: rendu par ImageResponse, pas par le navigateur */}
        <img src={EMBLEM} width={260} height={260} alt="" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: 12,
            lineHeight: 1,
            textShadow: `0 0 32px ${CYAN}`,
          }}
        >
          GHOM
        </div>
        <div style={{ fontSize: 48, color: MAGENTA }}>{t.role}</div>
        <div style={{ fontSize: 34, color: "#c4d4dc" }}>{t.line}</div>
      </div>
      <div
        style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#9fb4c0" }}
      >
        <span>{t.studio}</span>
        <span style={{ color: CYAN }}>Perpignan, France</span>
      </div>
    </div>,
    size,
  );
}
