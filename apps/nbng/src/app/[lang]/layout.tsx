import { LOCALE_META, LOCALES, localizePath } from "@ghom/core";
import { Toaster } from "@ghom/ui/components/sonner";
import { TooltipProvider } from "@ghom/ui/components/tooltip";
import type { Metadata, Viewport } from "next";
import { Bungee, Silkscreen, Space_Grotesk } from "next/font/google";
import { I18nProvider } from "@/i18n/client";
import { getLocale, loadDictionary } from "@/i18n/server";
import "../globals.css";

const display = Bungee({ subsets: ["latin"], weight: "400", variable: "--font-display-family" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body-family" });
const mono = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-family",
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await loadDictionary(locale);
  return {
    metadataBase: new URL("https://nobrainnogame.ghom.fr"),
    title: { default: t.meta.title, template: "%s · No Brain No Game" },
    description: t.meta.description,
    alternates: {
      canonical: localizePath(locale),
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l)])),
        "x-default": "/",
      },
    },
    openGraph: {
      title: "No Brain No Game",
      description: t.meta.description,
      siteName: "No Brain No Game",
      locale: LOCALE_META[locale].og,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].og),
      type: "website",
    },
  };
}

export const viewport: Viewport = { themeColor: "#050307", colorScheme: "dark" };

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`dark ${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <I18nProvider locale={locale} dict={await loadDictionary(locale)}>
          <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        </I18nProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
