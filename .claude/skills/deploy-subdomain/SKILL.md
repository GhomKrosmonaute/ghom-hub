---
name: deploy-subdomain
description: Deploy a No Brain No Game game to <label>.nobrainnogame.ghom.fr, or the site of one of Ghom's tools to <label>.ghom.fr — Vercel project, Neon database, optional Render realtime server, Google sign-in, Resend e-mail, OVH DNS, catalogue entry and end-to-end checks. Use when the user asks to deploy, host, release, "mettre en ligne" or "déployer" a game, tool or site on a subdomain of ghom.fr.
---

# Deploy a game or tool on a subdomain

Stack in use: **Vercel** (sites, team `ghom`, Hobby, region `fra1`), **Neon** (Postgres),
**Render** free plan (long-running/WebSocket servers only), **OVH** (DNS zone `ghom.fr`),
**Google Cloud** (OAuth), **Resend** (e-mail). The user keeps logged-in tabs on each: act
in them with claudecodebrowser (`browser_find_tabs`) rather than sending them clicking,
and stop only for what needs them (2FA codes, payments).

Reference deployment: `NoBrainNoGame/devgame` → https://devgame.nobrainnogame.ghom.fr
(Next 16 + Prisma + Better Auth + Bun realtime server on Render). Copy from it.

## 0. Decide and confirm

- **Host**: STUDIO game → `<label>.nobrainnogame.ghom.fr`; PERSONAL tool → `<label>.ghom.fr`.
  Reserved labels: `www api admin mail nobrainnogame`. DNS-safe: `[a-z0-9-]`.
- **Branch to release**: ask; it is usually `main` (never assume a feature branch).
- **Repo owner**: `NoBrainNoGame` org (studio) or `GhomKrosmonaute` (personal). Never
  `camille-aka-ghom`. If work in progress is uncommitted, ask before committing it, and
  commit **only your own files** when someone else is editing the same repo
  (`git status` first; test in a `git worktree` if needed).

```bash
export GH_TOKEN=$(gh auth token --user GhomKrosmonaute)   # active gh account may be camille-aka-ghom
git -c user.name=Ghom -c user.email=19586013+GhomKrosmonaute@users.noreply.github.com commit …
```

## 1. Make the app deployable

**Static site** (Vite, plain HTML): nothing special; Vercel detects it. Set Vite `base`
correctly if it is not served at `/`.

**Next.js**:
- `output: "standalone"` **breaks the Vercel build** (`ENOENT .next/next-server.js.nft.json`):
  `output: process.env.VERCEL ? undefined : "standalone"`.
- Next ≥ 15: `params` is a **Promise** everywhere, including `opengraph-image.tsx`
  (`(await params).locale`); read synchronously it is `undefined` and silently falls back.
- `vercel.json` (migrations run with the direct URL):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "installCommand": "bun install --frozen-lockfile",
  "buildCommand": "DATABASE_URL=\"${DATABASE_URL_UNPOOLED:-$DATABASE_URL}\" bun run db:deploy && bun run build",
  "regions": ["fra1"]
}
```

Prove it locally before pushing: `rm -rf .next && VERCEL=1 bun run build`, then
`bun run check` (or the repo's lint/typecheck/test).

## 2. Database (only if the app needs one) — Neon

- One Neon project per app, region Frankfurt; a database and role named after the app.
- Two URLs, `sslmode=verify-full`: **pooled** `DATABASE_URL` (host `-pooler`) for the app,
  **direct** `DATABASE_URL_UNPOOLED` for migrations.
- Keep them in a gitignored `.env.neon`, `chmod 600`, values **quoted** (`&` in URLs breaks
  `set -a; . .env.neon`). Never overwrite the developer's local `.env`.
- Apply and prove: `DATABASE_URL="$DATABASE_URL_UNPOOLED" bun run db:deploy`, then
  `bunx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`
  must print an empty migration.
- Generate app secrets with `openssl rand -hex 32` into a gitignored `.env.secrets` (600).

## 3. Long-running server (WebSocket, workers) — Render, only if needed

- `render.yaml` blueprint: `runtime: docker`, `plan: free`, `region: frankfurt`,
  `branch: main`, `healthCheckPath`, secrets as `sync: false`. Put it in Render project
  **« All »**. The Render GitHub app must be installed on the repo's org.
- Free instances **sleep after 15 min**. Do **not** add a keep-alive cron (it would also keep
  Neon awake and burn its quota). Instead the site pings the health URL when a visitor
  arrives and every 10 min while the tab is visible (devgame: `RealtimeWake.tsx`).
- Check: health 200, no ticket → 401, wrong `Origin` → 403, a valid ticket → 101.

## 4. Sign-in — Google OAuth (if the app has accounts)

Studio apps use the **NoBrainNoGame** Google account (`nobrainnogame-fr@proton.me`,
`authuser=2` in the user's browser; check the account before creating anything).
1. New project `<app>`; Google Auth Platform → Get started: app name, support e-mail,
   **External**, contact e-mail.
2. **Branding**: home page, privacy and terms URLs of the app. **No logo** (a logo forces a
   multi-day verification). Then Audience → **Publish app** (« In production »).
3. Clients → Web application: JS origin `https://<host>`, redirect
   `https://<host>/api/auth/callback/google` (Better Auth path).
4. Store `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env.secrets`.

Better Auth ≥ 1.7 keys accounts by **`(issuer, accountId)`**: the `account` table needs
`issuer TEXT NOT NULL` + a unique index, backfilled with `https://accounts.google.com`
(Google), `local:credential` (passwords), `local:oauth:<provider>` (others). Without it the
Google callback 500s with `Unknown argument issuer`.

## 5. E-mail — Resend (magic links, notifications)

- `nobrainnogame.ghom.fr` is **already a verified Resend domain** (eu-west-1): for a studio
  app just create an API key, permission **Sending access**, and set
  `EMAIL_FROM="<App> <login@nobrainnogame.ghom.fr>"`.
- A new sending domain needs its DKIM TXT (`resend._domainkey.<sub>`), `send.<sub>` and
  `rsend.<sub>` CNAMEs and optional `_dmarc.<sub>` at OVH. **Never** add Resend's MX on a
  host that is a CNAME to Vercel.

## 6. Vercel

1. Import the repo (team `ghom`). If it is not listed, add it to the Vercel GitHub app
   installation of the org. Root directory = the app (or `./`).
2. Environment variables (Production and Preview), typically: `DATABASE_URL`,
   `DATABASE_URL_UNPOOLED`, `APP_URL` / `BETTER_AUTH_URL` = `https://<host>`, the secrets,
   `GOOGLE_*`, `RESEND_API_KEY`, `EMAIL_FROM`, `REALTIME_URL`. The env form ignores
   synthetic paste events: fill Key/Value rows one by one (« Add More ») and re-read every
   value. Leave « Optional Integrations » empty (no Prisma Postgres).
3. Deploying may ask for a **2FA re-authentication code**: stop and ask the user.
4. Settings → Domains → Add `<host>`; read the CNAME value Vercel recommends.
5. Watch the build: `gh api repos/<owner>/<repo>/commits/<sha>/status` (context « Vercel »).
   On failure read the deployment's build log (Vercel tab) before changing anything.

## 7. DNS — OVH zone `ghom.fr`

No wildcard: every host needs its own record. In the zone, add
`<label>.nobrainnogame  CNAME  <value from Vercel>.` (e.g. `xxxx.vercel-dns-017.com.`;
`cname.vercel-dns.com.` also works).

**Never touch the e-mail records** (OVH's free pro mailbox): MX, SPF TXT, DKIM
`ovhmo-selector…`, SRV, and the `mail`, `smtp`, `imap`, `pop3`, `autoconfig`,
`autodiscover` CNAMEs.

Editing through the OVH manager tab: zone → « Modifier en mode textuel » (inside an iframe),
set the textarea with the native setter + `input`/`change`, **re-read it and diff the line
count** (only additions), then « Suivant » → « Valider ». Verify on the authoritative server:

```bash
dig +short @dns103.ovh.net <host> CNAME
dig +short @dns103.ovh.net ghom.fr MX | wc -l   # still 3
```

## 8. Catalogue

Add the project with the **add-project** skill (subdomain = `<label>`, owner matching the
host), including a cover in `apps/nbng/public/covers/` for a studio game.

## 9. Verify end to end, then report

```bash
B=https://<host>
for p in / /fr /en /api/health; do echo "$p $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' $B$p)"; done
curl -s -X POST $B/api/auth/sign-in/social -H 'content-type: application/json' -H "origin: $B" \
  -d '{"provider":"google","callbackURL":"/"}' | head -c 120       # → accounts.google.com URL
curl -s $B | grep -o '<meta property="og:image"[^>]*>'
```

Then ask the user to sign in and try the online features for real, and read the logs when
something fails: Vercel → project → Logs (filter level error / request path), Render →
service → Logs. Things seen in production so far:
- a signed-in player with **no profile row** got `409` from the realtime ticket route and
  the client retried forever → create the profile on demand (`upsert`);
- `localePrefix` changes in next-intl break locale-specific routes such as
  `opengraph-image` — re-check `/en` after any routing change.

Report: the live URL, what was verified and how, what was not tested (and why), every
secret that transited through the conversation (offer to rotate), and anything left for
the user (2FA, payments, choices).
