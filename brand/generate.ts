/**
 * Identité visuelle de No Brain No Game : la mascotte pixel art (brand/sprite.ts)
 * déclinée en logo, badge, favicon, photo de profil et bannières.
 *
 *   bun run brand        → brand/nobrainnogame/**
 *
 * - Assets "pixel pur" (logo transparent, favicons) : pixels exacts via ImageMagick.
 * - Compositions (fond cyber, badge avec texte, bannières) : HTML/SVG rendu par Chrome headless.
 */
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { gridToRgba, gridToSvgRects, HEIGHT, headGrid, spriteGrid, WIDTH } from "./sprite";

const ROOT = path.resolve(import.meta.dirname, "nobrainnogame");
const TMP = path.join(ROOT, ".tmp");
const CHROME = process.env.CHROME ?? "google-chrome";

const C = {
  lime: "#c6ff00",
  orange: "#ff5e1a",
  purple: "#a855ff",
  pink: "#ff4f9a",
  void: "#050307",
};

const sprite = spriteGrid();
const head = headGrid();

// ───────────────────────── Outils ─────────────────────────

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function run(cmd: string[]) {
  const proc = Bun.spawn(cmd, { stdout: "ignore", stderr: "pipe" });
  if ((await proc.exited) !== 0) {
    throw new Error(`${cmd[0]} a échoué : ${await new Response(proc.stderr).text()}`);
  }
}

function out(file: string) {
  const p = path.join(ROOT, file);
  mkdirSync(path.dirname(p), { recursive: true });
  return p;
}

const log = (file: string, note = "") =>
  console.log(`✔ ${path.relative(process.cwd(), path.join(ROOT, file))}${note ? `  ${note}` : ""}`);

/** Grille → PNG au pixel près (agrandissement "plus proche voisin", marge transparente). */
async function pixelPng(grid: (string | null)[][], file: string, scale: number, pad = 0) {
  const w = grid[0]!.length;
  const h = grid.length;
  const raw = path.join(TMP, `${path.basename(file)}.rgba`);
  writeFileSync(raw, gridToRgba(grid));
  const size = `${(w + pad * 2) * scale}x${(h + pad * 2) * scale}`;
  await run([
    "magick",
    "-size",
    `${w}x${h}`,
    "-depth",
    "8",
    `rgba:${raw}`,
    "-filter",
    "point",
    "-resize",
    `${scale * 100}%`,
    "-background",
    "none",
    "-gravity",
    "center",
    "-extent",
    size,
    out(file),
  ]);
  log(file, size.replace("x", "×"));
}

/** SVG vectoriel "pixel" (net à toute taille). */
function pixelSvg(grid: (string | null)[][], pad = 0): string {
  const w = grid[0]!.length + pad * 2;
  const h = grid.length + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${gridToSvgRects(grid, 1, pad, pad)}</svg>\n`;
}

// ───────────────────────── Habillage HTML ─────────────────────────

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bungee&family=Silkscreen:wght@400;700&family=Space+Grotesk:wght@500;600&display=block";

const baseCss = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { overflow: hidden; }
  body { position: relative; font-family: "Space Grotesk", sans-serif; color: #f4f0f8; }
  .layer { position: absolute; inset: 0; }
  .pixel { font-family: "Silkscreen", monospace; -webkit-font-smoothing: none; letter-spacing: .08em; }
  .extrude {
    font-family: "Bungee", sans-serif; text-transform: uppercase; line-height: .84;
    text-shadow: 1px 1px 0 ${C.orange}, 2px 2px 0 ${C.orange}, 3px 3px 0 #cc4b15,
      4px 4px 0 #993811, 5px 5px 0 #66260b, 7px 7px 22px rgb(0 0 0 / .85);
  }
  .scanlines { background: repeating-linear-gradient(0deg, rgb(0 0 0 / .28) 0 1px, transparent 1px 3px); mix-blend-mode: multiply; }
  .vignette { background: radial-gradient(ellipse at center, transparent 50%, rgb(0 0 0 / .78)); }
  .stars i { position: absolute; display: block; }
  svg { display: block; }
`;

function stars(n: number, w: number, h: number, seed: number, size = 2) {
  const rand = mulberry32(seed);
  const colors = [C.lime, C.orange, C.purple, C.pink, "#ffffff"];
  return Array.from({ length: n }, () => {
    const s = rand() < 0.85 ? size : size * 1.5;
    const c = colors[Math.floor(rand() * colors.length)];
    return `<i style="left:${(rand() * w).toFixed(0)}px;top:${(rand() * h).toFixed(0)}px;width:${s}px;height:${s}px;background:${c};opacity:${(0.25 + rand() * 0.6).toFixed(2)}"></i>`;
  }).join("");
}

/** Sol en perspective du portail (lignes violettes / orange). */
function floor(horizonPct: number, cell = 64) {
  return `<div class="layer" style="top:${horizonPct}%;perspective:420px;overflow:hidden">
    <div style="position:absolute;left:-60%;right:-60%;top:0;height:260%;transform:rotateX(64deg);transform-origin:top;
      background:
        repeating-linear-gradient(90deg, rgb(168 85 255 / .55) 0 2px, transparent 2px ${cell}px),
        repeating-linear-gradient(0deg, rgb(255 94 26 / .45) 0 2px, transparent 2px ${cell}px);
      mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 60%, transparent);"></div>
  </div>`;
}

/** Fond "cyber" commun : halos, étoiles pixel, sol en perspective. */
function cyberBackground(w: number, h: number, horizon: number, starSize = 2) {
  return `
    <div class="layer" style="background:
      radial-gradient(circle at 50% 42%, rgb(255 79 154 / .20), transparent 38%),
      radial-gradient(circle at 50% 60%, rgb(198 255 0 / .12), transparent 50%),
      radial-gradient(ellipse at 50% 100%, rgb(255 94 26 / .22), transparent 55%), ${C.void}"></div>
    <div class="layer stars">${stars(Math.round((w * h) / 9000), w, h, 3, starSize)}</div>
    ${floor(horizon, Math.round(w / 22))}`;
}
const crt = `<div class="layer scanlines"></div><div class="layer vignette"></div>`;

/** La mascotte en SVG, avec halo néon (rose pour le cerveau, vert pour la lame). */
function mascot(px: number, glow = true) {
  const w = WIDTH * px;
  const h = HEIGHT * px;
  const filter = glow
    ? `filter: drop-shadow(0 0 ${px * 0.6}px rgb(255 79 154 / .55)) drop-shadow(0 0 ${px * 1.6}px rgb(198 255 0 / .28));`
    : "";
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" style="${filter}">${gridToSvgRects(sprite, px)}</svg>`;
}

/** Ombre portée au sol. */
function shadow(px: number) {
  return `<div style="width:${18 * px}px;height:${px * 2}px;margin:${-px}px auto 0;background:rgb(0 0 0 / .55);
    box-shadow: 0 0 ${px * 2}px ${px}px rgb(168 85 255 / .35);"></div>`;
}

function page(w: number, h: number, body: string, bg = "transparent") {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}">
  <style>${baseCss} html,body{width:${w}px;height:${h}px;background:${bg}}</style></head><body>${body}</body></html>`;
}

async function shot(
  file: string,
  html: string,
  w: number,
  h: number,
  dpr = 1,
  transparent = false,
) {
  const htmlPath = path.join(TMP, `${path.basename(file)}.html`);
  writeFileSync(htmlPath, html);
  await run([
    CHROME,
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    ...(transparent ? ["--default-background-color=00000000"] : []),
    `--window-size=${w},${h}`,
    `--force-device-scale-factor=${dpr}`,
    "--virtual-time-budget=8000",
    `--screenshot=${out(file)}`,
    `file://${htmlPath}`,
  ]);
  log(file, `${w * dpr}×${h * dpr}`);
}

// ───────────────────────── Compositions ─────────────────────────

/** Logo sur fond cyber (carré). */
function logoCyber(S: number) {
  const px = Math.floor((S * 0.7) / HEIGHT);
  return page(
    S,
    S,
    `${cyberBackground(S, S, 68, Math.max(2, S / 400))}
    <div class="layer" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:${S * 0.04}px">
      ${mascot(px)}${shadow(px)}
    </div>${crt}`,
    C.void,
  );
}

/**
 * Badge : médaillon pixel (anneaux néon), mascotte au centre, ruban "NO BRAIN NO GAME".
 * `theme` adapte le rendu au fond (halo néon sur noir, ombre portée nette sur blanc).
 */
function badge(theme: "transparent" | "white" | "black") {
  const S = 1024;
  const P = 16; // taille d'un "pixel" du médaillon
  const N = 56; // médaillon de 56×56 pixels
  const r = N / 2;
  const cells: string[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const d = Math.hypot(x + 0.5 - r, y + 0.5 - r);
      let c: string | null = null;
      if (d < r - 0.2) c = "#0b0814";
      if (d < r - 1.2) c = C.lime;
      if (d < r - 2.4) c = "#0b0814";
      if (d < r - 3.4) c = C.orange;
      if (d < r - 4.4) c = (x + y) % 2 === 0 && d > r - 9 ? "#1a1228" : "#120c1c";
      if (c) cells.push(`<rect x="${x * P}" y="${y * P}" width="${P}" height="${P}" fill="${c}"/>`);
    }
  }
  const medal = N * P; // 896
  const px = 18;
  const effect =
    theme === "black"
      ? "filter: drop-shadow(0 0 18px rgb(198 255 0 / .45)) drop-shadow(0 0 60px rgb(255 79 154 / .25));"
      : theme === "white"
        ? "filter: drop-shadow(12px 12px 0 rgb(11 8 20 / .9));"
        : "";
  const bg = theme === "white" ? "#ffffff" : theme === "black" ? "#000000" : "transparent";
  return page(
    S,
    S,
    `<div class="layer" style="display:grid;place-items:center">
      <div style="position:relative;width:${medal}px;height:${medal}px;${effect}">
        <svg width="${medal}" height="${medal}" shape-rendering="crispEdges">${cells.join("")}</svg>
        <div style="position:absolute;left:50%;top:${medal * 0.13}px;transform:translateX(-50%)">${mascot(px, false)}</div>
        <div style="position:absolute;left:50%;bottom:${medal * 0.09}px;transform:translateX(-50%);
          background:${C.lime};color:#0b0814;padding:14px 34px 12px;white-space:nowrap;
          box-shadow: 0 0 0 8px #0b0814, 8px 8px 0 8px ${C.orange};">
          <span class="pixel" style="font-size:46px;font-weight:700;letter-spacing:.06em">NO BRAIN NO GAME</span>
        </div>
      </div>
    </div>`,
    bg,
  );
}

/** Photo de profil : fond cyber, mascotte centrée (zone sûre pour un recadrage rond). */
function profile() {
  const S = 1000;
  const px = 21;
  return page(
    S,
    S,
    `${cyberBackground(S, S, 70, 3)}
    <div class="layer" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding-top:40px">
      ${mascot(px)}${shadow(px)}
    </div>${crt}`,
    C.void,
  );
}

/** Bannière 3:1 : titre à gauche (hors de la zone de l'avatar sur X), mascotte à droite. */
function banner(lang: "en" | "fr") {
  const W = 1500;
  const H = 500;
  const t =
    lang === "en"
      ? {
          kicker: "INDEPENDENT VIDEO GAME STUDIO",
          line: "Tactical & strategy games · play in your browser",
        }
      : {
          kicker: "STUDIO DE JEUX VIDÉO INDÉPENDANT",
          line: "Jeux tactiques & stratégiques · jouables dans le navigateur",
        };
  const px = 12;
  return page(
    W,
    H,
    `
    <div class="layer" style="background:
      radial-gradient(ellipse at 82% 45%, rgb(255 79 154 / .20), transparent 40%),
      radial-gradient(ellipse at 80% 90%, rgb(255 94 26 / .20), transparent 50%),
      radial-gradient(ellipse at 20% 0%, rgb(168 85 255 / .14), transparent 55%), ${C.void}"></div>
    <div class="layer stars">${stars(160, W, H, 9)}</div>
    ${floor(64)}
    <div style="position:absolute;right:120px;bottom:44px;display:flex;flex-direction:column;align-items:center">
      ${mascot(px)}${shadow(px)}
    </div>
    <div class="layer" style="padding:0 0 0 340px;display:flex;flex-direction:column;justify-content:center;gap:14px">
      <p class="pixel" style="color:${C.orange};font-size:15px">${t.kicker}</p>
      <h1 class="extrude" style="font-size:104px">
        <span style="display:block;color:${C.lime}">No Brain</span>
        <span style="display:block;color:#f4f0f8">No Game</span>
      </h1>
      <p style="font-size:22px;font-weight:500;color:rgb(244 240 248 / .85);margin-top:10px">${t.line}</p>
      <p class="pixel" style="font-size:14px;color:${C.lime};text-shadow:0 0 14px ${C.lime}">▶ PRESS START
        <span style="color:#8f8299;margin-left:18px">nobrainnogame.ghom.fr</span></p>
    </div>
    ${crt}
    <div class="layer" style="box-shadow: inset 0 0 0 2px rgb(198 255 0 / .18)"></div>`,
    C.void,
  );
}

/** Icône Apple (180 px) : la tête-cerveau sur fond sombre. */
function appleIcon() {
  const S = 180;
  const px = 10;
  return page(
    S,
    S,
    `<div class="layer" style="background:radial-gradient(circle at 50% 45%, rgb(255 79 154 / .35), transparent 60%), ${C.void}"></div>
     <div class="layer" style="display:grid;place-items:center">
       <svg width="${16 * px}" height="${16 * px}" shape-rendering="crispEdges">${gridToSvgRects(head, px)}</svg>
     </div>`,
    C.void,
  );
}

// ───────────────────────── Génération ─────────────────────────

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

// Logo
writeFileSync(out("logo/logo.svg"), pixelSvg(sprite, 1));
log("logo/logo.svg", "vectoriel");
await pixelPng(sprite, "logo/logo-transparent-512.png", 16);
await pixelPng(sprite, "logo/logo-transparent-1024.png", 30, 1);
await shot("logo/logo-cyber-1024.png", logoCyber(1024), 1024, 1024);

// Badge
await shot("badge/badge-transparent.png", badge("transparent"), 1024, 1024, 1, true);
await shot("badge/badge-on-white.png", badge("white"), 1024, 1024);
await shot("badge/badge-on-black.png", badge("black"), 1024, 1024);

// Favicon
writeFileSync(out("favicon/favicon.svg"), pixelSvg(head));
log("favicon/favicon.svg", "vectoriel");
await pixelPng(head, "favicon/favicon-16.png", 1);
await pixelPng(head, "favicon/favicon-32.png", 2);
await pixelPng(head, "favicon/favicon-48.png", 3);
await run([
  "magick",
  out("favicon/favicon-16.png"),
  out("favicon/favicon-32.png"),
  out("favicon/favicon-48.png"),
  out("favicon/favicon.ico"),
]);
log("favicon/favicon.ico", "16 + 32 + 48");
await shot("favicon/apple-touch-icon.png", appleIcon(), 180, 180);

// Réseaux sociaux
await shot("social/profile.png", profile(), 1000, 1000);
await shot("social/banner-en.png", banner("en"), 1500, 500, 2);
await shot("social/banner-fr.png", banner("fr"), 1500, 500, 2);

rmSync(TMP, { recursive: true, force: true });

// Archive de tout le branding (dans le dossier généré, pour l'envoyer d'un bloc)
const ZIP = "nobrainnogame-branding.zip";
const zip = Bun.spawn(["zip", "-r", "-X", "-q", ZIP, "logo", "badge", "favicon", "social"], {
  cwd: ROOT,
  stdout: "ignore",
  stderr: "pipe",
});
if ((await zip.exited) !== 0) {
  throw new Error(`zip a échoué : ${await new Response(zip.stderr).text()}`);
}
log(ZIP, `${(Bun.file(path.join(ROOT, ZIP)).size / 1024 / 1024).toFixed(1)} Mo`);

// Favicons du portail studio (nobrainnogame.ghom.fr) : copiés là où Next.js les sert
// automatiquement (conventions app/favicon.ico, app/icon.svg, app/apple-icon.png).
const app = path.resolve(import.meta.dirname, "../apps/nbng/src/app");
for (const [from, to] of [
  ["favicon/favicon.ico", "favicon.ico"],
  ["favicon/favicon.svg", "icon.svg"],
  ["favicon/apple-touch-icon.png", "apple-icon.png"],
] as const) {
  copyFileSync(out(from), path.join(app, to));
  console.log(`✔ apps/nbng/src/app/${to}  ← ${from}`);
}
