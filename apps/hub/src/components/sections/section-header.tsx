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
    <header className="mb-10 flex flex-wrap items-end gap-x-4 gap-y-2 md:mb-14">
      <span className="font-display text-5xl leading-none font-black text-transparent [-webkit-text-stroke:1px_var(--glow,var(--neon-1))] md:text-7xl">
        {code}
      </span>
      <ScrambleText
        as="h2"
        text={title}
        className="relative z-10 pb-0.5 font-display text-3xl leading-none font-bold uppercase tracking-wide md:pb-1 md:text-5xl"
      />
      <p className="hud-label relative z-10 mb-1 bg-[#05060b]/85 px-2 py-0.5 text-[0.7rem] text-[var(--glow,var(--neon-1))] backdrop-blur-sm md:mb-2">
        {kicker}
      </p>
      <span className="relative z-0 mb-3 hidden h-px min-w-12 flex-1 bg-gradient-to-r from-[var(--glow,var(--neon-1))]/60 to-transparent md:block" />
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
