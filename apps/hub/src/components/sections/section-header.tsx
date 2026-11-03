import { ScrambleText } from "@ghom/ui/cyber/scramble-text";

export function SectionHeader({
  code,
  kicker,
  title,
}: {
  code: string;
  kicker: string;
  title: string;
}) {
  return (
    <header className="mb-10 flex items-end gap-4 md:mb-14">
      <span className="font-display text-5xl leading-none font-black text-transparent [-webkit-text-stroke:1px_var(--glow,var(--neon-1))] md:text-7xl">
        {code}
      </span>
      <div className="pb-1">
        <p className="hud-label text-[var(--glow,var(--neon-1))]">{kicker}</p>
        <ScrambleText
          as="h2"
          text={title}
          className="font-display text-3xl font-bold uppercase tracking-wide md:text-5xl"
        />
      </div>
      <span className="mb-3 hidden h-px flex-1 bg-gradient-to-r from-[var(--glow,var(--neon-1))]/60 to-transparent md:block" />
    </header>
  );
}

/** Panneau "verre fumé" lisible au-dessus de la 3D. */
export function Panel({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`cyber-clip relative border border-white/5 bg-[#05060b]/80 backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
