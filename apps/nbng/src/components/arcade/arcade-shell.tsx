"use client";

import { NavContextMenu } from "@ghom/ui/cyber/nav-context-menu";
import { pointer, usePointerTracking } from "@ghom/ui/hooks/use-pointer";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useI18n } from "@/i18n/client";
import type { ProjectView } from "@/lib/projects";
import { Bezel } from "./bezel";
import { addScore } from "./score";
import { goTo, isTyping, STAGES } from "./stages";
import { useStudioNav } from "./use-studio-nav";

const BrainScene = dynamic(() => import("../scene/brain-scene"), { ssr: false });

/** Scène 3D + cadre de borne + menu du clic droit + raccourcis clavier + points au scroll. */
export function ArcadeShell({
  hubUrl,
  games,
  rootDomain,
  children,
}: {
  hubUrl: string;
  games: ProjectView[];
  rootDomain: string;
  children: React.ReactNode;
}) {
  usePointerTracking();
  const { t } = useI18n();
  const nav = useStudioNav({ games, hubUrl, rootDomain });

  useEffect(() => {
    // Chaque pixel parcouru rapporte des points. Parce que pourquoi pas.
    let last = window.scrollY;
    const onScroll = () => {
      const d = Math.abs(window.scrollY - last);
      last = window.scrollY;
      if (d > 0) addScore(d * 0.5);
    };
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      const stage = STAGES[Number(e.key) - 1];
      if (stage) {
        playSfx("click");
        goTo(stage.id);
      }
      if (e.key === "Enter" && pointer.scroll < 0.05) {
        playSfx("coin");
        goTo("jeux");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <NavContextMenu
      groups={nav}
      labels={t.contextMenu}
      className="pixel-font text-xs [--glow2:var(--neon-2)]"
    >
      <div aria-hidden className="fixed inset-0 bg-void">
        <BrainScene />
      </div>
      {children}
      <Bezel hubUrl={hubUrl} rootDomain={rootDomain} />
    </NavContextMenu>
  );
}
