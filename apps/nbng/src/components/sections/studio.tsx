import { fill } from "@ghom/core";
import { Ticker } from "@ghom/ui/cyber/ticker";
import { getDictionary } from "@/i18n/server";

export async function Studio({
  stats,
  hubUrl,
}: {
  stats: { label: string; value: number }[];
  hubUrl: string;
}) {
  const t = await getDictionary();
  return (
    <section id="studio" className="relative scroll-mt-16 py-28">
      <Ticker
        items={t.studio.ticker}
        speed={30}
        className="pixel-font -rotate-1 border-y-2 border-neon-1 bg-neon-1 py-2 text-sm text-black [--glow:black]"
      />
      <div className="px-8 pt-20 md:px-20 lg:px-28">
        <header className="mb-12">
          <p className="pixel-font text-xs text-neon-2">{t.studio.stage}</p>
          <h2 className="extrude mt-2 font-display text-4xl uppercase md:text-6xl">
            {t.studio.title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">
            {t.studio.body}{" "}
            <a href={hubUrl} className="text-[#00f0ff] underline-offset-4 hover:underline">
              GHOM
            </a>
            .
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {t.studio.rules.map((r, i) => (
            <article
              key={r.title}
              className="group border-2 border-white/10 bg-black/70 p-6 backdrop-blur transition-all duration-150 hover:-translate-y-1 hover:border-neon-1 hover:shadow-[6px_6px_0_var(--neon-2)]"
            >
              <p className="pixel-font text-xs text-neon-2">
                {fill(t.studio.rule, { n: String(i + 1).padStart(2, "0") })}
              </p>
              <h3 className="mt-3 font-display text-2xl uppercase text-neon-1">{r.title}</h3>
              <p className="mt-2 text-foreground/75">{r.text}</p>
            </article>
          ))}
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-px border-2 border-white/10 bg-white/10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-black/80 p-5 backdrop-blur">
              <dt className="pixel-font text-[0.6rem] text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 font-display text-4xl text-neon-1">
                {String(s.value).padStart(2, "0")}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
