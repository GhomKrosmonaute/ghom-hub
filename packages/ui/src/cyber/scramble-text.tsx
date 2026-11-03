"use client";

import { useScramble } from "@ghom/ui/hooks/use-scramble";
import { cn } from "@ghom/ui/lib/utils";
import { type ElementType, useEffect, useRef, useState } from "react";

interface ScrambleTextProps {
  text: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  /** Rejoue l'effet au survol */
  replayOnHover?: boolean;
}

/** Texte qui se décrypte quand il entre dans le champ de vision. */
export function ScrambleText({
  text,
  as: Tag = "span",
  className,
  duration = 800,
  replayOnHover = true,
}: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { output, replay } = useScramble(text, { duration, autoplay: visible });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "-10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      aria-label={text}
      className={cn("inline-block", className)}
      onPointerEnter={replayOnHover ? replay : undefined}
    >
      <span aria-hidden>{output}</span>
    </Tag>
  );
}
