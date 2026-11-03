"use client";

import { Button } from "@ghom/ui/components/button";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { cn } from "@ghom/ui/lib/utils";
import { Code2, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import type { ProjectView } from "@/lib/projects";
import { addScore } from "../arcade/score";
import { isTyping } from "../arcade/stages";
import { PixelSprite } from "./pixel-sprite";

const PLAYABLE = new Set(["LIVE", "BETA"]);

/** Écran de sélection façon borne : liste de cartouches + grand écran de prévisualisation. */
export function GameSelect({ games }: { games: ProjectView[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const section = useRef<HTMLElement>(null);
  const inView = useRef(false);
  const game = games[index];

  const select = (i: number) => {
    const next = (i + games.length) % games.length;
    if (next === index) return;
    playSfx("hover");
    addScore(50);
    setIndex(next);
  };

  // Navigation au clavier quand l'écran de sélection est visible
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = Boolean(e?.isIntersecting);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    const onKey = (e: KeyboardEvent) => {
      if (!inView.current || isTyping(e)) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        select(index + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        select(index - 1);
      } else if (e.key === "Enter" && game?.url && PLAYABLE.has(game.status)) {
        playSfx("coin");
        window.open(game.url, "_blank", "noopener");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  });

  if (!game) {
    return (
      <section id="jeux" className="px-8 py-28 md:px-20 lg:px-28">
        <p className="pixel-font text-center text-muted-foreground">{t.games.empty}</p>
      </section>
    );
  }

  const playable = Boolean(game.url) && PLAYABLE.has(game.status);

  return (
    <section ref={section} id="jeux" className="relative scroll-mt-16 px-8 py-28 md:px-20 lg:px-28">
      <header className="mb-10 text-center">
        <p className="pixel-font text-xs text-neon-2">{t.games.stage}</p>
        <h2 className="extrude mt-2 font-display text-4xl uppercase md:text-6xl">
          {t.games.title}
        </h2>
        <p className="pixel-font mt-3 hidden text-[0.6rem] text-muted-foreground md:block">
          {t.games.keys}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,360px)_1fr]">
        {/* Cartouches */}
        <ol className="flex flex-col gap-2" aria-label={t.games.aria}>
          {games.map((g, i) => {
            const on = i === index;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  aria-current={on}
                  onClick={() => select(i)}
                  onPointerEnter={() => select(i)}
                  style={{ "--glow": g.accent } as React.CSSProperties}
                  className={cn(
                    "group relative flex w-full items-center gap-3 border-2 bg-black/70 p-3 text-left backdrop-blur transition-all duration-150",
                    on
                      ? "translate-x-2 border-[var(--glow)] shadow-[4px_4px_0_var(--glow)]"
                      : "border-white/10 hover:border-white/30",
                  )}
                >
                  <span
                    className={cn(
                      "pixel-font w-4 text-xs text-[var(--glow)]",
                      on ? "animate-blink" : "opacity-0",
                    )}
                  >
                    ▶
                  </span>
                  <PixelSprite seed={g.slug} color={g.accent} className="size-10 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate font-display text-lg uppercase"
                      style={{ color: on ? g.accent : undefined }}
                    >
                      {g.name}
                    </span>
                    <span className="pixel-font block truncate text-[0.55rem] text-muted-foreground">
                      {g.genre} · {g.stock}
                    </span>
                  </span>
                  <span className="pixel-font text-[0.6rem] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Écran */}
        <article
          key={game.id}
          style={{ "--glow": game.accent } as React.CSSProperties}
          className="relative overflow-hidden rounded-[18px] border-2 border-[var(--glow)] bg-black/85 shadow-[0_0_60px_-20px_var(--glow),inset_0_0_80px_rgb(0_0_0/0.9)] backdrop-blur"
        >
          <div className="relative grid aspect-[16/8] max-h-[44vh] w-full place-items-center overflow-hidden border-b-2 border-[var(--glow)]/40 [animation:crt-on_.45s_ease-out]">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 60%, color-mix(in oklab, ${game.accent} 35%, transparent), transparent 60%), repeating-linear-gradient(90deg, transparent 0 22px, color-mix(in oklab, ${game.accent} 10%, transparent) 22px 23px)`,
              }}
            />
            {game.coverUrl ? (
              // biome-ignore lint/performance/noImgElement: visuels externes
              <img
                src={game.coverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <PixelSprite
                seed={game.slug}
                color={game.accent}
                className="relative h-[62%] w-auto animate-bounce drop-shadow-[0_0_20px_var(--glow)] [animation-duration:1.6s]"
              />
            )}
            <div className="scanlines absolute inset-0" />
            <p className="pixel-font absolute top-3 left-4 text-[0.6rem] text-[var(--glow)]">
              {game.ref}
            </p>
            <p className="pixel-font absolute top-3 right-4 bg-[var(--glow)] px-1.5 py-0.5 text-[0.55rem] text-black">
              {game.stock}
            </p>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-[1.4fr_1fr] md:p-7">
            <div>
              <h3 className="font-display text-3xl uppercase text-[var(--glow)] md:text-4xl">
                {game.name}
              </h3>
              <p className="mt-1 text-lg text-foreground/90">{game.tagline}</p>
              <p className="mt-3 leading-relaxed text-foreground/70">{game.description}</p>
            </div>
            <div className="flex flex-col gap-4">
              <dl className="pixel-font grid grid-cols-2 gap-x-4 gap-y-3 text-[0.6rem]">
                {[
                  [t.games.genre, game.genre ?? "—"],
                  [t.games.players, game.players ?? "—"],
                  [t.games.platforms, game.platforms.join(" / ") || "—"],
                  [t.games.release, String(game.year)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-neon-2">{k}</dt>
                    <dd className="mt-0.5 text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto flex flex-wrap gap-3">
                {playable ? (
                  <Button asChild size="lg" className="flex-1">
                    <a
                      href={game.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playSfx("coin")}
                    >
                      <Play /> {t.games.play}
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" disabled className="flex-1">
                    {t.games.soon}
                  </Button>
                )}
                {game.repoUrl && (
                  <Button asChild size="lg" variant="outline">
                    <a
                      href={game.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.games.source}
                    >
                      <Code2 />
                    </a>
                  </Button>
                )}
              </div>
              {game.host && (
                <p className="pixel-font truncate text-[0.55rem] text-muted-foreground">
                  {game.host}
                </p>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
