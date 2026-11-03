import type { Localized } from "@ghom/core";
import { en } from "./en";
import { type Dictionary, fr } from "./fr";

export type { Dictionary as HubDictionary };
export const hubDictionaries: Localized<Dictionary> = { fr, en };
