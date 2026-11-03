/**
 * Exécute un loader ; en cas d'échec (DB down, pas de DATABASE_URL…),
 * renvoie un repli et le signale. Le site reste affichable.
 */
export async function withFallback<T>(
  label: string,
  loader: () => Promise<T>,
  fallback: () => T,
  log: (msg: string) => void = (m) => console.warn(m),
): Promise<{ data: T; source: "db" | "fallback" }> {
  try {
    return { data: await loader(), source: "db" };
  } catch (error) {
    const reason = error instanceof Error ? error.message.split("\n")[0] : String(error);
    log(`[db] ${label} : repli sur les données de seed (${reason})`);
    return { data: fallback(), source: "fallback" };
  }
}
