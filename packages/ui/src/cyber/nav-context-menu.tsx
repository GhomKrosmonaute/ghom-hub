"use client";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@ghom/ui/components/context-menu";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import type { NavGroup, NavItem } from "@ghom/ui/lib/nav";
import { wantsNativeMenu } from "@ghom/ui/lib/nav";
import { cn } from "@ghom/ui/lib/utils";
import { Copy, ExternalLink } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";

export interface NavContextMenuLabels {
  /** Titre du groupe affiché quand on fait un clic droit sur un lien. */
  link: string;
  openLink: string;
  copyLink: string;
  copied: string;
  /** Rappel en pied de menu : comment obtenir le menu natif. */
  nativeHint: string;
}

/**
 * Remplace le menu contextuel du navigateur sur tout le site par la navigation
 * du site (mêmes entrées que le terminal ⌘K). Le menu natif reste disponible
 * dans les champs de saisie, sur une sélection de texte, ou avec Maj + clic droit.
 */
export function NavContextMenu({
  groups,
  labels,
  children,
  className,
}: {
  groups: NavGroup[];
  labels: NavContextMenuLabels;
  children: React.ReactNode;
  className?: string;
}) {
  const [link, setLink] = useState<string | null>(null);

  // Phase de capture sur window : on stoppe l'événement avant React (et donc Radix)
  // sans appeler preventDefault → le navigateur affiche son propre menu.
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      if (wantsNativeMenu(e, window.getSelection()?.toString())) e.stopPropagation();
    };
    window.addEventListener("contextmenu", onContextMenu, { capture: true });
    return () => window.removeEventListener("contextmenu", onContextMenu, { capture: true });
  }, []);

  const select = (item: NavItem) => {
    playSfx("click");
    item.run();
  };

  const renderItem = (item: NavItem) =>
    item.checked === undefined ? (
      <ContextMenuItem key={item.id} disabled={item.disabled} onSelect={() => select(item)}>
        {item.icon}
        <span className="truncate">{item.label}</span>
        {item.hint && (
          <span className="ml-auto max-w-40 truncate pl-4 text-[0.65rem] text-muted-foreground">
            {item.hint}
          </span>
        )}
        {item.shortcut && <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>}
      </ContextMenuItem>
    ) : (
      <ContextMenuCheckboxItem
        key={item.id}
        checked={item.checked}
        disabled={item.disabled}
        onCheckedChange={() => select(item)}
        onSelect={(e) => e.preventDefault()}
      >
        {item.label}
        {item.shortcut && <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>}
      </ContextMenuCheckboxItem>
    );

  return (
    <ContextMenu
      modal={false}
      onOpenChange={(open) => {
        if (open) playSfx("lock");
      }}
    >
      <ContextMenuTrigger
        asChild
        onContextMenu={(e) => {
          const a = (e.target as Element | null)?.closest?.("a[href]");
          setLink(a instanceof HTMLAnchorElement ? a.href : null);
        }}
      >
        <div className="contents">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent className={cn("w-72 font-mono", className)}>
        {link && (
          <>
            <ContextMenuLabel>{labels.link}</ContextMenuLabel>
            <ContextMenuItem
              onSelect={() => {
                playSfx("click");
                window.open(link, "_blank", "noopener");
              }}
            >
              <ExternalLink />
              {labels.openLink}
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => {
                playSfx("click");
                navigator.clipboard?.writeText(link).then(
                  () => toast.success(labels.copied),
                  () => {},
                );
              }}
            >
              <Copy />
              {labels.copyLink}
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        {groups.map((group, gi) => (
          <Fragment key={group.id}>
            {gi > 0 && <ContextMenuSeparator />}
            {group.submenu ? (
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  {group.submenu.icon}
                  {group.submenu.label}
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className={cn("w-72 font-mono", className)}>
                  <ContextMenuLabel>{group.heading}</ContextMenuLabel>
                  {group.items.map(renderItem)}
                </ContextMenuSubContent>
              </ContextMenuSub>
            ) : (
              <>
                <ContextMenuLabel>{group.heading}</ContextMenuLabel>
                {group.items.map(renderItem)}
              </>
            )}
          </Fragment>
        ))}
        <ContextMenuSeparator />
        <p className="px-2 py-1 text-[0.55rem] tracking-[0.15em] text-muted-foreground/70 uppercase">
          {labels.nativeHint}
        </p>
      </ContextMenuContent>
    </ContextMenu>
  );
}
