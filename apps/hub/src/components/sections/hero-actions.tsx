"use client";

import { Button } from "@ghom/ui/components/button";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { ChevronsDown, Gamepad2 } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { goTo } from "../hud/sections";

export function HeroActions() {
  const { t } = useI18n();
  return (
    <div className="mt-10 flex flex-wrap gap-4">
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
