"use client";

import { cn } from "@ghom/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/", "Bord"],
  ["/projets", "Projets"],
  ["/messages", "Messages"],
  ["/abonnes", "Abonnés"],
  ["/profil", "Profil"],
  ["/traductions", "Textes"],
] as const;

/** Barre de navigation compacte pour mobile (la sidebar est masquée). */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Administration"
      className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b border-neon-1/15 bg-[#05060b]/95 px-3 py-2 backdrop-blur md:hidden"
    >
      {LINKS.map(([href, label]) => {
        const on = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "shrink-0 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.15em]",
              on ? "bg-neon-1/15 text-neon-1" : "text-muted-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
