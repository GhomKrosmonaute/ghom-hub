import type { Localized } from "@ghom/core";
import { en } from "./en";
import { type Dictionary, fr } from "./fr";

export type { Dictionary as StudioDictionary };
export const studioDictionaries: Localized<Dictionary> = { fr, en };
