"use client";

import { Button } from "@ghom/ui/components/button";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { ChevronsDown, Gamepad2 } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { goTo } from "../hud/sections";

export function HeroActions() {
  const { t } = useI18n();
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:flex sm:flex-wrap [&>button]:w-full sm:[&>button]:w-auto">
      <Button
        size="lg"
        data-lock={t.sections.arsenal}
        onPointerEnter={() => playSfx("hover")}
        onClick={() => {
          playSfx("click");
          goTo("arsenal");
        }}
      >
        <ChevronsDown />
        {t.hero.openArsenal}
      </Button>
      <Button
        size="lg"
        variant="outline"
        style={{ "--glow": "var(--neon-2)" } as React.CSSProperties}
        data-lock={t.hero.dossier}
        onPointerEnter={() => playSfx("hover")}
        onClick={() => {
          playSfx("click");
          goTo("pilote");
        }}
      >
        {t.hero.dossier}
      </Button>
      <Button
        size="lg"
        variant="ghost"
        className="text-foreground/80 hover:text-foreground"
        data-lock={t.sections.studio}
        onClick={() => goTo("studio")}
        onPointerEnter={() => playSfx("hover")}
      >
        <Gamepad2 />
        No Brain No Game
      </Button>
    </div>
  );
}
