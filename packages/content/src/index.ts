export * from "./dictionary";
export * from "./funding";
export * from "./hub";
export * from "./nbng";
export * from "./profile";

/** Sites dont les textes sont administrables. */
export const SITES = ["HUB", "STUDIO"] as const;
export type Site = (typeof SITES)[number];
