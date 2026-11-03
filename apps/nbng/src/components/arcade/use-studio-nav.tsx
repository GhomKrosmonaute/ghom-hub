"use client";

import { FUNDING_URLS } from "@ghom/content";
import { otherLocale } from "@ghom/core";
import { CurrencyIcon } from "@ghom/ui/cyber/currency-icon";
import { setSfxEnabled, useSfxEnabled } from "@ghom/ui/hooks/use-sfx";
import { type NavGroup, switchLocale } from "@ghom/ui/lib/nav";
import { ArrowLeft, Gamepad2, Languages, Play, Power, Swords } from "lucide-react";
import { useI18n } from "@/i18n/client";
import type { ProjectView } from "@/lib/projects";
import { goTo, STAGES } from "./stages";

const PLAYABLE = new Set(["LIVE", "BETA"]);

/** Navigation du portail studio pour le menu du clic droit. */
export function useStudioNav({
  games,
  hubUrl,
  rootDomain,
}: {
  games: ProjectView[];
  hubUrl: string;
  rootDomain: string;
}): NavGroup[] {
  const { t, locale } = useI18n();
  const sfx = useSfxEnabled();

  return [
    {
      id: "navigation",
      heading: t.nav.navigation,
      items: [
        {
          id: "start",
          label: t.nav.start,
          icon: <Power />,
          run: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        },
        ...STAGES.map((s) => ({
          id: s.id,
          label: `${s.code} · ${t.stages[s.id]}`,
          icon: <Gamepad2 />,
          shortcut: s.code.slice(-1),
          run: () => goTo(s.id),
        })),
      ],
    },
    {
      id: "games",
      heading: t.nav.games,
      submenu: { label: t.nav.games, icon: <Swords /> },
      items: games.map((g) => {
        const playable = Boolean(g.url) && PLAYABLE.has(g.status);
        return {
          id: g.id,
          label: g.name,
          hint: playable ? (g.genre ?? undefined) : t.nav.soon,
          icon: <Play />,
          disabled: !playable,
          run: () => window.open(g.url!, "_blank", "noopener"),
        };
      }),
    },
    {
      id: "systems",
      heading: t.nav.systems,
      items: [
        {
          id: "support",
          label: t.nav.support,
          icon: <CurrencyIcon locale={locale} />,
          hint: "Buy Me a Coffee",
          run: () => window.open(FUNDING_URLS.studio, "_blank", "noopener"),
        },
        {
          id: "hub",
          label: t.nav.hub,
          icon: <ArrowLeft />,
          run: () => window.location.assign(hubUrl),
        },
        {
          id: "language",
          label: t.nav.language,
          icon: <Languages />,
          run: () => switchLocale(otherLocale(locale), rootDomain),
        },
        { id: "sfx", label: t.nav.sfx, checked: sfx, run: () => setSfxEnabled(!sfx) },
      ],
    },
  ];
}
