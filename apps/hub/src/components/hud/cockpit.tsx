"use client";

import { NavContextMenu } from "@ghom/ui/cyber/nav-context-menu";
import { usePointerTracking } from "@ghom/ui/hooks/use-pointer";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import type { ProjectView } from "@/lib/projects";
import { BootSequence } from "./boot-sequence";
import { CommandPalette } from "./command-palette";
import { Reticle } from "./reticle";
import { goTo, isTyping, SECTIONS } from "./sections";
import { useHubNav } from "./use-hub-nav";
import { Visor } from "./visor";

const HubScene = dynamic(() => import("../scene/hub-scene"), { ssr: false });

/**
 * Tout ce qui "entoure" le contenu : scène 3D, visière, réticule, terminal,
 * menu du clic droit, raccourcis clavier.
 */
export function Cockpit({
  projects,
  studioUrl,
  offline,
  rootDomain,
  children,
}: {
  projects: ProjectView[];
  studioUrl: string;
  offline: boolean;
  rootDomain: string;
  children: React.ReactNode;
}) {
  usePointerTracking();
  const { t } = useI18n();
  const [palette, setPalette] = useState(false);
  const nav = useHubNav({ projects, studioUrl, rootDomain, openPalette: () => setPalette(true) });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
        return;
      }
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        setPalette(true);
        return;
      }
      const section = SECTIONS.find((s) => s.code.endsWith(e.key));
      if (section) goTo(section.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <NavContextMenu groups={nav} labels={t.contextMenu}>
      <div aria-hidden className="fixed inset-0 bg-void">
        <HubScene />
      </div>
      {children}
      <Visor onOpenPalette={() => setPalette(true)} offline={offline} rootDomain={rootDomain} />
      <Reticle />
      <CommandPalette open={palette} onOpenChange={setPalette} groups={nav} />
      <BootSequence projectCount={projects.length} />
    </NavContextMenu>
  );
}
