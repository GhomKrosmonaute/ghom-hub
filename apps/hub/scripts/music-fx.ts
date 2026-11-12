/**
 * Extrait les « pistes d'animation » de chaque morceau pour le fond du site : trois bandes isolées
 * (vraie basse 30–80 Hz, médiums, aigus), leurs enveloppes à 50 images/s et leurs coups.
 *
 * Usage : bun scripts/music-fx.ts <dossier des mp3>  →  écrit <id>.fx.json à côté de chaque mp3.
 * Format : { fps, env (basse), mid, high : base64 d'octets 0–255 (une valeur par image),
 *            hits (basse), snares (médium), ticks (aigu) : secondes des coups,
 *            power : puissance 0–1 de chaque coup de basse, d'autant plus forte qu'il est rare }.
 */
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FPS = 50;

/** Enveloppe RMS (dB) à FPS images/s d'une bande isolée par une chaîne de filtres ffmpeg. */
async function envelope(file: string, filters: string, rate: number) {
  const proc = Bun.spawn(
    [
      "ffmpeg",
      "-v",
      "error",
      "-i",
      file,
      "-af",
      filters,
      "-ac",
      "1",
      "-ar",
      String(rate),
      "-f",
      "f32le",
      "-",
    ],
    { stdout: "pipe" },
  );
  const pcm = new Float32Array(await new Response(proc.stdout).arrayBuffer());
  const win = rate / FPS;
  const db: number[] = [];
  for (let i = 0; i + win <= pcm.length; i += win) {
    let s = 0;
    for (let j = i; j < i + win; j++) s += (pcm[j] as number) ** 2;
    db.push(10 * Math.log10(s / win + 1e-12));
  }
  return db;
}

/** Normalise sur la dynamique du morceau : plancher = 20e centile (au plus 40 dB sous le plafond), plafond = 99e. */
function normalise(db: number[]) {
  const sorted = [...db].sort((a, b) => a - b);
  const q = (k: number) => sorted[Math.floor((sorted.length - 1) * k)] as number;
  const hi = q(0.99);
  const lo = Math.max(q(0.2), hi - 40);
  return db.map((v) => Math.min(1, Math.max(0, (v - lo) / (hi - lo))));
}

/**
 * Coups : montée d'au moins `rise` en `span` images, au-dessus de `min`, puis tenue au-dessus de
 * `hold` pendant `holdFrames` images (0 = pas de tenue exigée), avec un écart minimal entre deux coups.
 */
function onsets(
  env: number[],
  o: { rise: number; span: number; min: number; hold: number; holdFrames: number; gap: number },
) {
  const hits: number[] = [];
  let last = -o.gap;
  for (let i = o.span; i < env.length - o.holdFrames; i++) {
    const v = env[i] as number;
    if (v < o.min || v - (env[i - o.span] as number) < o.rise || i - last < o.gap) continue;
    let held = true;
    for (let k = 1; k <= o.holdFrames; k++) if ((env[i + k] as number) < o.hold) held = false;
    if (!held) continue;
    hits.push(Math.round((i / FPS) * 100) / 100);
    last = i;
  }
  return hits;
}

/**
 * Puissance de chaque coup de basse : plus la basse est rare, plus elle frappe.
 * Densité locale = nombre de coups dans les 4 s autour (3 s avant, 1 s après) ; un coup isolé
 * vaut 1, un coup noyé dans un passage à 3 coups/s vaut environ 0,2.
 */
function rarity(hits: number[]) {
  return hits.map((t, i) => {
    let n = 0;
    for (const h of hits) if (h >= t - 3 && h <= t + 1) n++;
    const rate = n / 4;
    const gap = i > 0 ? t - (hits[i - 1] as number) : 4;
    const p = (1 / (1 + rate * 1.4)) * (0.6 + 0.4 * Math.min(1, gap / 1.5));
    return Math.round(Math.min(1, Math.max(0.12, p * 1.25)) * 100) / 100;
  });
}

const b64 = (env: number[]) =>
  Buffer.from(Uint8Array.from(env, (v) => Math.round(v * 255))).toString("base64");

async function analyse(file: string) {
  const lp = "lowpass=f=80";
  const [bassDb, midDb, highDb] = await Promise.all([
    // Vraie basse : 30–80 Hz, filtre raide.
    envelope(file, `highpass=f=30,highpass=f=30,${lp},${lp},${lp},${lp}`, 2000),
    // Médiums : caisse claire, synthés, mélodie (300 Hz – 2,5 kHz).
    envelope(file, "highpass=f=300,highpass=f=300,lowpass=f=2500,lowpass=f=2500", 8000),
    // Aigus : charleston, cymbales, scintillements (5 – 14 kHz).
    envelope(file, "highpass=f=5000,highpass=f=5000,highpass=f=5000", 32000),
  ]);
  const bass = normalise(bassDb);
  const mid = normalise(midDb);
  const high = normalise(highDb);
  return {
    bass,
    mid,
    high,
    // Un vrai coup de basse : montée franche ET tenue 80 ms (un pic isolé ne passe pas).
    hits: onsets(bass, { rise: 0.25, span: 3, min: 0.55, hold: 0.45, holdFrames: 4, gap: 6 }),
    // Caisse claire / accent médium : montée nette, tenue courte.
    snares: onsets(mid, { rise: 0.22, span: 2, min: 0.6, hold: 0.4, holdFrames: 2, gap: 6 }),
    // Charleston / scintillement : transitoires brèves, sans tenue.
    ticks: onsets(high, { rise: 0.2, span: 2, min: 0.5, hold: 0, holdFrames: 0, gap: 4 }),
  };
}

const dir = process.argv[2];
if (!dir) throw new Error("usage: bun scripts/music-fx.ts <dossier des mp3>");
for (const f of readdirSync(dir).filter((n) => n.endsWith(".mp3"))) {
  const a = await analyse(join(dir, f));
  const out = {
    fps: FPS,
    env: b64(a.bass),
    mid: b64(a.mid),
    high: b64(a.high),
    hits: a.hits,
    power: rarity(a.hits),
    snares: a.snares,
    ticks: a.ticks,
  };
  writeFileSync(join(dir, f.replace(/\.mp3$/, ".fx.json")), JSON.stringify(out));
  const dur = a.bass.length / FPS;
  const r = (n: number) => (n / dur).toFixed(2);
  console.log(
    f,
    `basse ${r(a.hits.length)}/s`,
    `médium ${r(a.snares.length)}/s`,
    `aigu ${r(a.ticks.length)}/s`,
  );
}
