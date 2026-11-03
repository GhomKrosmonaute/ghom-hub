"use client";

import { Button } from "@ghom/ui/components/button";

/** Base injoignable ou erreur inattendue : message clair plutôt qu'une page blanche. */
export default function DashError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="border border-destructive/40 bg-destructive/5 p-8">
      <p className="hud-label text-destructive">Liaison perdue</p>
      <h1 className="mt-2 font-display text-2xl font-bold">Impossible de charger cette page</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        La base de données ne répond pas (ou une erreur inattendue s&apos;est produite). Vérifie que
        Postgres tourne et que DATABASE_URL est correct.
      </p>
      <p className="mt-2 font-mono text-xs text-muted-foreground">{error.message}</p>
      <Button className="mt-6" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
