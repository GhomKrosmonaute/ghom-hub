"use client";

import { FUNDING_URLS } from "@ghom/content";
import { otherLocale } from "@ghom/core";
import { CurrencyIcon } from "@ghom/ui/cyber/currency-icon";
import { setSfxEnabled, useSfxEnabled } from "@ghom/ui/hooks/use-sfx";
import { type NavGroup, switchLocale } from "@ghom/ui/lib/nav";
import { Crosshair, ExternalLink, Gamepad2, Languages, Rocket, SquareTerminal } from "lucide-react";
import { useI18n } from "@/i18n/client";
import type { ProjectView } from "@/lib/projects";
import { goTo, SECTIONS } from "./sections";

/**
 * Navigation du hub, partagée par le terminal ⌘K et le menu du clic droit.
 * L'entrée "terminal" n'a de sens que dans le menu contextuel (id "terminal").
 */
export function useHubNav({
  projects,
  studioUrl,
  rootDomain,
  openPalette,
}: {
  projects: ProjectView[];
  studioUrl: string;
  rootDomain: string;
  openPalette: () => void;
}): NavGroup[] {
  const { t, locale } = useI18n();
  const sfx = useSfxEnabled();

  return [
    {
      id: "navigation",
      heading: t.palette.navigation,
      items: [
        ...SECTIONS.map((s) => ({
          id: s.id,
          label: t.sections[s.id],
          icon: <Crosshair />,
          shortcut: s.code.slice(-1),
          keywords: t.palette.goTo,
          run: () => goTo(s.id),
        })),
      ],
    },
    {
      id: "launch",
      heading: t.palette.launch,
      submenu: { label: t.palette.launch, icon: <Rocket /> },
      items: projects
        .filter((p) => p.url)
        .map((p) => ({
          id: p.id,
          label: p.name,
          hint: p.host ?? undefined,
          icon: <ExternalLink />,
          keywords: `${t.palette.launch} ${p.tagline}`,
          run: () => window.open(p.url!, "_blank", "noopener"),
        })),
    },
    {
      id: "systems",
      heading: t.palette.systems,
      items: [
        {
          id: "terminal",
          label: t.palette.openTerminal,
          icon: <SquareTerminal />,
          shortcut: "Ctrl K",
          run: openPalette,
        },
        {
          id: "studio",
          label: t.palette.studioPortal,
          icon: <Gamepad2 />,
          keywords: "studio no brain no game",
          run: () => window.location.assign(studioUrl),
        },
        {
          id: "support",
          label: t.palette.support,
          icon: <CurrencyIcon locale={locale} />,
          hint: "Buy Me a Coffee",
          keywords: "don soutien funding coffee café support",
          run: () => window.open(FUNDING_URLS.personal, "_blank", "noopener"),
        },
        {
          id: "support-studio",
          label: t.palette.supportStudio,
          icon: <CurrencyIcon locale={locale} />,
          hint: "Buy Me a Coffee",
          keywords: "don soutien funding coffee café support studio no brain no game",
          run: () => window.open(FUNDING_URLS.studio, "_blank", "noopener"),
        },
        {
          id: "language",
          label: t.palette.language,
          icon: <Languages />,
          keywords: "langue language english français",
          run: () => switchLocale(otherLocale(locale), rootDomain),
        },
        {
          id: "sfx",
          label: t.palette.sfx,
          keywords: "audio son sound sfx",
          checked: sfx,
          run: () => setSfxEnabled(!sfx),
        },
      ],
    },
  ];
}
