import { cv } from "@ghom/content";
import { LOCALES, localizePath } from "@ghom/core";
import type { Metadata } from "next";
import { CvSheet } from "@/components/cv/cv-sheet";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = cv[locale];
  return {
    title: `${t.ui.pageTitle} · ${t.name}`,
    description: t.ui.description,
    alternates: {
      canonical: localizePath(locale, "/cv"),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, "/cv")])),
    },
  };
}

export default async function Page() {
  return <CvSheet locale={await getLocale()} />;
}
