import { notFound } from "next/navigation";

/** Toute URL inconnue sous /fr ou /en → page 404 traduite (app/[lang]/not-found.tsx). */
export default function CatchAll() {
  notFound();
}
