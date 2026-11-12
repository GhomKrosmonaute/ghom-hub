/**
 * Génère les PDF du CV (FR, EN) à partir de la page /cv du hub.
 * Usage : lancer le hub (`bun run dev` ou `start`), puis `bun run cv:pdf [url-du-hub]`.
 * Les fichiers vont dans apps/hub/public/cv/ et sont servis tels quels par ghom.fr.
 */
import { chromium } from "playwright";
import { cvPdfPath } from "../packages/content/src/cv";

const base = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [locale, path] of [
  ["fr", "/cv"],
  ["en", "/en/cv"],
] as const) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const out = `apps/hub/public${cvPdfPath(locale)}`;
  await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log(`${locale} → ${out}`);
}
await browser.close();
