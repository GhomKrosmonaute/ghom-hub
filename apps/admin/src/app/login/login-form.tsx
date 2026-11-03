"use client";

import { Button } from "@ghom/ui/components/button";
import { Input } from "@ghom/ui/components/input";
import { Label } from "@ghom/ui/components/label";
import { KeyRound, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <div className="grid gap-2">
        <Label htmlFor="password" className="hud-label text-foreground/70">
          Code d'accès
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "login-error" : undefined}
        />
      </div>
      {state.error && (
        <p id="login-error" role="alert" className="font-mono text-xs text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
        Déverrouiller
      </Button>
    </form>
  );
}
