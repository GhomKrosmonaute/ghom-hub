"use client";

import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { goTo } from "../arcade/stages";

export function PressStart() {
  return (
    <button
      type="button"
      onPointerEnter={() => playSfx("hover")}
      onClick={() => {
        playSfx("coin");
        goTo("jeux");
      }}
      className="pixel-font group mt-12 inline-flex items-center gap-4 text-xl text-neon-1 md:text-3xl"
    >
      <span className="animate-[press-start_1.1s_steps(1)_infinite] [text-shadow:0_0_18px_var(--neon-1)] group-hover:animate-none">
        ▶ PRESS START
      </span>
    </button>
  );
}
