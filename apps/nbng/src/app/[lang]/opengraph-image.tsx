import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isLocale } from "@ghom/core";
import { ImageResponse } from "next/og";

export const alt = "No Brain No Game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEXT = {
  fr: {
    kicker: "Studio de jeux vidéo indépendant",
    line: "Jeux tactiques et stratégiques, jouables dans le navigateur.",
    motto: "Pas de cerveau, pas de jeu.",
  },
  en: {
    kicker: "Independent video game studio",
    line: "Tactical and strategy games you play in the browser.",
    motto: "No brain, no game.",
  },
};

const LIME = "#c6ff00";
const ORANGE = "#ff5e1a";
const PURPLE = "#a855ff";

/** Aperçu partagé (Open Graph / réseaux sociaux) du portail No Brain No Game. */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = TEXT[isLocale(lang) ? lang : "fr"];
  const icon = await readFile(join(process.cwd(), "src/app/icon.svg"), "base64");
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#050307",
        backgroundImage: `radial-gradient(circle at 80% 20%, rgba(168,85,255,.35), transparent 45%), radial-gradient(circle at 10% 100%, rgba(255,94,26,.25), transparent 40%)`,
        color: "#f4f1f8",
        border: `6px solid ${LIME}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            letterSpacing: 5,
            color: LIME,
            textTransform: "uppercase",
          }}
        >
          {t.kicker}
        </div>
        {/* biome-ignore lint/performance/noImgElement: rendu par ImageResponse, pas par le navigateur */}
        <img src={`data:image/svg+xml;base64,${icon}`} width={112} height={112} alt="" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.95 }}>
        <div style={{ fontSize: 132, fontWeight: 900, color: LIME, letterSpacing: -2 }}>
          NO BRAIN
        </div>
        <div
          style={{ fontSize: 132, fontWeight: 900, letterSpacing: -2, display: "flex", gap: 30 }}
        >
          <span style={{ color: ORANGE }}>NO</span>
          <span style={{ color: PURPLE }}>GAME</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ color: "#e2dceb", fontSize: 34 }}>{t.line}</span>
        <span style={{ color: LIME, fontSize: 32 }}>{t.motto}</span>
      </div>
    </div>,
    size,
  );
}
