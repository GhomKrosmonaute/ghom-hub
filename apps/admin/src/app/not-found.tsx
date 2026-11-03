import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="space-y-4">
        <p className="hud-label text-destructive">404</p>
        <h1 className="font-display text-4xl font-bold">Introuvable</h1>
        <Link href="/" className="font-mono text-sm text-neon-1 hover:underline">
          ◂ Tableau de bord
        </Link>
      </div>
    </main>
  );
}
