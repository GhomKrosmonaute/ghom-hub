import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function NotFound() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main className="grid min-h-dvh place-items-center bg-void p-6 text-center">
      <div className="space-y-6">
        <p className="pixel-font text-sm text-neon-2">{t.notFound.code}</p>
        <h1 className="extrude font-display text-6xl text-neon-1 md:text-8xl">
          {t.notFound.title}
        </h1>
        <Link
          href={`/${locale}`}
          className="pixel-font animate-[press-start_1s_steps(1)_infinite] text-sm text-foreground"
        >
          {t.notFound.continue}
        </Link>
      </div>
    </main>
  );
}
