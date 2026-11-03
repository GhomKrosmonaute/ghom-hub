import { localizePath } from "@ghom/core";
import { GlitchText } from "@ghom/ui/cyber/glitch-text";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function NotFound() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <main className="tech-grid grid min-h-dvh place-items-center bg-void p-6 text-center">
      <div className="space-y-6">
        <p className="hud-label text-destructive">{t.notFound.code}</p>
        <GlitchText
          as="h1"
          text={t.notFound.title}
          intense
          className="font-display text-6xl font-black md:text-8xl"
        />
        <p className="text-muted-foreground">{t.notFound.body}</p>
        <Link
          href={localizePath(locale)}
          className="neon-text font-mono text-sm uppercase tracking-[0.3em] underline-offset-8 hover:underline"
        >
          {t.notFound.back}
        </Link>
      </div>
    </main>
  );
}
