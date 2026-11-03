import { cn } from "@ghom/ui/lib/utils";
import type { ElementType } from "react";

/** Titre avec aberration RGB découpée en bandes (pur CSS, compatible RSC). */
export function GlitchText({
  text,
  as: Tag = "span",
  className,
  intense = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  intense?: boolean;
}) {
  return (
    <Tag className={cn("glitch", className)} data-text={text} data-intense={intense || undefined}>
      {text}
    </Tag>
  );
}
