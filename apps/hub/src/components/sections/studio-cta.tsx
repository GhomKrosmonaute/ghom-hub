"use client";

import { FUNDING_URLS } from "@ghom/content";
import { Button } from "@ghom/ui/components/button";
import { CurrencyIcon } from "@ghom/ui/cyber/currency-icon";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/i18n/client";

export function StudioCta({ href }: { href: string }) {
  const { t, locale } = useI18n();
  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg" onPointerEnter={() => playSfx("hover")}>
          <a href={href} data-lock={t.studio.ctaLock} onClick={() => playSfx("click")}>
            {t.studio.cta} <ArrowUpRight />
          </a>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          style={{ "--glow": "#ff5e1a" } as React.CSSProperties}
          onPointerEnter={() => playSfx("hover")}
        >
          <a
            href={FUNDING_URLS.studio}
            target="_blank"
            rel="noopener noreferrer"
            data-lock={t.studio.support}
            onClick={() => playSfx("click")}
          >
            <CurrencyIcon locale={locale} /> {t.studio.support}
          </a>
        </Button>
      </div>
      <p className="mt-3 max-w-lg text-sm text-muted-foreground">{t.studio.supportNote}</p>
    </div>
  );
}
