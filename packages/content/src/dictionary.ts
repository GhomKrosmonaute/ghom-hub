/**
 * Outils communs aux dictionnaires d'interface : les fichiers TS sont les
 * valeurs par défaut (typées, versionnées) ; l'admin stocke des surcharges
 * clé → texte en base, appliquées par `applyOverrides`.
 */

/** Même forme qu'un dictionnaire littéral, mais chaque texte est une chaîne quelconque. */
export type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export interface DictionaryEntry {
  /** Chemin pointé : "hero.scroll", "studio.ticker.2", "studio.rules.0.title". */
  key: string;
  value: string;
}

/** Aplatit un dictionnaire en liste de textes (ordre de déclaration conservé). */
export function flattenDictionary(dict: unknown, prefix = ""): DictionaryEntry[] {
  if (typeof dict === "string") return [{ key: prefix, value: dict }];
  if (!dict || typeof dict !== "object") return [];
  return Object.entries(dict).flatMap(([k, v]) =>
    flattenDictionary(v, prefix ? `${prefix}.${k}` : k),
  );
}

/**
 * Copie du dictionnaire avec les surcharges appliquées. Une clé qui ne
 * désigne pas un texte existant est ignorée : la structure reste celle du code.
 */
export function applyOverrides<D>(dict: D, overrides: Record<string, string>): D {
  const keys = Object.keys(overrides);
  if (keys.length === 0) return dict;
  const out = structuredClone(dict) as unknown;
  for (const key of keys) {
    const value = overrides[key];
    if (typeof value !== "string" || value.trim() === "") continue;
    const path = key.split(".");
    const last = path.pop();
    let node: unknown = out;
    for (const segment of path) {
      node =
        node && typeof node === "object" ? (node as Record<string, unknown>)[segment] : undefined;
    }
    if (
      last !== undefined &&
      node &&
      typeof node === "object" &&
      Object.hasOwn(node, last) &&
      typeof (node as Record<string, unknown>)[last] === "string"
    ) {
      (node as Record<string, unknown>)[last] = value;
    }
  }
  return out as D;
}

/** Variables {x} d'un texte, triées. */
export function templateVars(text: string): string[] {
  return (text.match(/\{\w+\}/g) ?? []).sort();
}

/** Un texte traduit doit garder exactement les variables du texte de référence. */
export function sameTemplateVars(reference: string, candidate: string): boolean {
  const a = templateVars(reference);
  const b = templateVars(candidate);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
