export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="hud-label text-neon-2">{kicker}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-wide">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </header>
  );
}

/** Panneau de contenu de l'admin. */
export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`border border-white/8 bg-[#05060b]/80 backdrop-blur ${className}`}>
      {children}
    </section>
  );
}
