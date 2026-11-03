/**
 * Limite les tentatives de connexion : par IP, et globalement (attaque distribuée).
 * En mémoire : suffisant pour l'unique instance de l'admin ; remis à zéro au redémarrage.
 */
export class LoginLimiter {
  private readonly failures = new Map<string, number[]>();

  constructor(
    private readonly perKey = 5,
    private readonly global = 30,
    private readonly windowMs = 15 * 60 * 1000,
  ) {}

  private recent(key: string, now: number): number[] {
    const list = (this.failures.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (list.length) this.failures.set(key, list);
    else this.failures.delete(key);
    return list;
  }

  /** Secondes à attendre avant de pouvoir réessayer (0 = autorisé). */
  retryAfter(key: string, now = Date.now()): number {
    const blocking = [
      { list: this.recent(key, now), max: this.perKey },
      { list: this.recent("*", now), max: this.global },
    ].filter(({ list, max }) => list.length >= max);
    if (blocking.length === 0) return 0;
    const until = Math.max(
      ...blocking.map(({ list, max }) => list[list.length - max]! + this.windowMs),
    );
    return Math.ceil((until - now) / 1000);
  }

  fail(key: string, now = Date.now()) {
    for (const k of [key, "*"]) this.failures.set(k, [...this.recent(k, now), now]);
  }

  reset(key: string) {
    this.failures.delete(key);
  }
}

export const loginLimiter = new LoginLimiter();
