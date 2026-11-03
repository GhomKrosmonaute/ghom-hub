"use client";

import { cn } from "@ghom/ui/lib/utils";
import {
  Boxes,
  ExternalLink,
  Inbox,
  Languages,
  LayoutDashboard,
  LogOut,
  Mail,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

const NAV = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/projets", label: "Projets & jeux", icon: Boxes },
  { href: "/messages", label: "Messages", icon: Inbox, badge: "unread" as const },
  { href: "/abonnes", label: "Abonnés", icon: Mail },
  { href: "/profil", label: "Profil", icon: UserRound },
  { href: "/traductions", label: "Traductions", icon: Languages },
];

export function Sidebar({
  unread,
  sites,
}: {
  unread: number;
  sites: { label: string; href: string }[];
}) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-r border-neon-1/15 bg-[#05060b]/90 backdrop-blur max-md:hidden">
      <div className="px-5 pt-6 pb-8">
        <p className="hud-label text-neon-2">Console</p>
        <p className="font-display text-2xl font-bold tracking-wide neon-text">{"GHOM//ADMIN"}</p>
      </div>
      <nav aria-label="Administration" className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => {
          const on = active(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 border-l-2 px-3 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors",
                on
                  ? "border-neon-1 bg-neon-1/10 text-neon-1"
                  : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && unread > 0 && (
                <span className="bg-neon-2 px-1.5 text-[0.6rem] font-bold text-black">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="grid gap-1 border-t border-white/5 px-3 py-4">
        {sites.map((s) => (
          <a
            key={s.href}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
            {s.label}
          </a>
        ))}
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-3.5" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
