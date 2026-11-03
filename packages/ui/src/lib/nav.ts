import { type Locale, localeCookie, localizePath } from "@ghom/core";
import type { ReactNode } from "react";

/**
 * Modèle de navigation partagé entre le terminal (⌘K) et le menu contextuel (clic droit) :
 * une seule source de vérité, deux présentations.
 */
export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Raccourci clavier affiché à droite. */
  shortcut?: string;
  /** Info secondaire (hôte d'un projet…). */
  hint?: string;
  /** Mots-clés supplémentaires pour la recherche du terminal. */
  keywords?: string;
  disabled?: boolean;
  /** Défini → l'entrée est une case à cocher (ex : effets sonores). */
  checked?: boolean;
  run: () => void;
}

export interface NavGroup {
  id: string;
  heading: string;
  items: NavItem[];
  /** Dans le menu contextuel, regrouper les entrées dans un sous-menu (listes longues). */
  submenu?: { label: string; icon?: ReactNode };
}

const EDITABLE = "input, textarea, select, [contenteditable=''], [contenteditable=true]";

interface MenuEventLike {
  shiftKey: boolean;
  target: EventTarget | null;
}

/**
 * Faut-il laisser le menu natif du navigateur ? Oui dans les champs de saisie
 * (copier / coller / correcteur), quand du texte est sélectionné, ou avec Maj.
 */
export function wantsNativeMenu(e: MenuEventLike, selection?: string | null): boolean {
  if (e.shiftKey) return true;
  if (selection && selection.trim().length > 0) return true;
  const target = e.target as { closest?: (s: string) => unknown } | null;
  return Boolean(target?.closest?.(EDITABLE));
}

/** Mémorise la langue (cookie partagé entre les sous-domaines) et recharge la page traduite. */
export function switchLocale(locale: Locale, rootDomain?: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: cookie lu côté serveur par le proxy Next
  document.cookie = localeCookie(locale, rootDomain);
  window.location.assign(localizePath(locale, window.location.pathname) + window.location.hash);
}
