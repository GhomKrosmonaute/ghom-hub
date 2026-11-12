import { cv, defaultProfile } from "@ghom/content";
import { LOCALE_META, LOCALES, type Locale, localizePath } from "@ghom/core";
import { Toaster } from "@ghom/ui/components/sonner";
import { TooltipProvider } from "@ghom/ui/components/tooltip";
import type { Metadata, Viewport } from "next";
import { Chakra_Petch, JetBrains_Mono, Tektur } from "next/font/google";
import { I18nProvider } from "@/i18n/client";
import { getLocale, loadDictionary } from "@/i18n/server";
import "../globals.css";

const display = Tektur({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display-family",
});
const body = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-family",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-family" });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await loadDictionary(locale);
  return {
    metadataBase: new URL("https://ghom.fr"),
    title: { default: t.meta.title, template: "%s · GHOM" },
    description: t.meta.description,
    alternates: {
      canonical: localizePath(locale),
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l)])),
        "x-default": "/",
      },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      siteName: "ghom.fr",
      locale: LOCALE_META[locale].og,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].og),
      type: "website",
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
  };
}

export const viewport: Viewport = { themeColor: "#020204", colorScheme: "dark" };

const SITE = "https://ghom.fr";
const STUDIO = "https://nobrainnogame.ghom.fr";
const PUBLIC_PROFILES = ["GitHub", "LinkedIn", "Malt"];

function buildJsonLd(locale: Locale, description: string) {
  const c = cv[locale];
  const url = SITE + localizePath(locale);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE}/#person`,
        name: c.name.replace(/[«»“”]\s*[^«»“”]*[«»“”]\s*/, "").replace(/\s+/g, " "),
        alternateName: "Ghom",
        jobTitle: c.role,
        description,
        url,
        address: { "@type": "PostalAddress", addressLocality: "Perpignan", addressCountry: "FR" },
        sameAs: defaultProfile.links
          .filter((l) => PUBLIC_PROFILES.includes(l.label))
          .map((l) => l.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        name: "GHOM",
        url: SITE,
        inLanguage: locale,
        publisher: { "@id": `${SITE}/#person` },
      },
      {
        "@type": "Organization",
        "@id": `${STUDIO}/#organization`,
        name: "No Brain No Game",
        url: STUDIO,
        founder: { "@id": `${SITE}/#person` },
      },
    ],
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dict = await loadDictionary(locale);
  const jsonLd = JSON.stringify(buildJsonLd(locale, dict.meta.description)).replace(
    /</g,
    "\\u003c",
  );
  return (
    <html lang={locale} className={`dark ${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD statique, "<" échappé */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        <I18nProvider locale={locale} dict={dict}>
          <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        </I18nProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
