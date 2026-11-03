# ghom-hub

Monorepo des deux portails :

| App | Domaine | Description |
| --- | --- | --- |
| `apps/hub` | **ghom.fr** | Hub perso : boutique tech cyberpunk pilotée depuis un exosquelette (visière HUD, réticule, ville néon 3D). Présente GHOM et ses projets. |
| `apps/admin` | **admin.ghom.fr** | Console privée : projets & jeux, messages, abonnés, profil, tous les textes FR/EN. |
| `apps/nbng` | **nobrainnogame.ghom.fr** | Hub du studio No Brain No Game : borne d'arcade CRT, cerveau en voxels 3D, écran de sélection des jeux. |

Les projets sont servis sur leurs propres sous-domaines :

- projet perso → `<projet>.ghom.fr`
- jeu du studio → `<jeu>.nobrainnogame.ghom.fr`

## Stack

Bun · TypeScript · Turbo · Next.js 16 · three.js (React Three Fiber + postprocessing) · Tailwind 4 · shadcn/ui · PostgreSQL · Prisma 7 · Biome · `bun test`

```
apps/
  hub/       ghom.fr
  nbng/      nobrainnogame.ghom.fr
  admin/     admin.ghom.fr (console d'administration)
packages/
  content/   contenus par défaut : dictionnaires FR/EN, profil, liens de soutien
  core/      logique métier pure et testée (URLs de sous-domaines, catalogue, validation zod, sprites…)
  db/        schéma Prisma, client, requêtes, seed (+ repli si la base est injoignable)
  ui/        composants shadcn re-stylés + primitives cyber (glitch, scramble, sons, pointeur)
  typescript-config/
infra/       Dockerfile, compose de prod, Caddyfile
```

## Développement

```bash
bun install
bun db:up          # Postgres dans Docker
bun db:migrate     # applique les migrations
bun db:seed        # charge les projets d'exemple
bun dev            # hub → :3000 · studio → :3001 · admin → :3002
```

Autres commandes : `bun test`, `bun typecheck`, `bun lint`, `bun format`, `bun run build`, `bun db:studio`.

Le `.env` est unique, à la racine (copie de `.env.example`). Sans base de données, les sites
s'affichent quand même avec les données de seed (le HUD affiche alors « MODE AUTONOME »).

## Contenu à personnaliser

- **Ta présentation** : dans l'admin (`/profil`) ; valeurs par défaut dans `packages/content/src/profile.ts`.
- **Projets et jeux** : en base (`bun db:studio`), ou dans `packages/db/src/seed-data.ts` puis `bun db:seed`.
  Les projets fournis sont des **exemples**.
  - `owner` : `PERSONAL` (listé sur ghom.fr) ou `STUDIO` (listé sur le portail du studio)
  - `subdomain` : juste le label (`ledger`, `void-tactics`), l'hôte complet est calculé
  - `status` : `LIVE` = « EN STOCK », `BETA` = « ACCÈS ANTICIPÉ », `IN_DEV`, `PROTOTYPE`, `ARCHIVED`
  - `accent` : la couleur néon de la fiche produit
- **Textes de l'interface (FR / EN)** : dans l'admin (`/traductions`) ; valeurs par défaut dans
  `packages/content/src/<hub|nbng>/fr.ts` (source) et `en.ts`.
  Le type de `en.ts` est dérivé de `fr.ts` : une clé manquante ou en trop casse le typecheck, et un test
  vérifie que les variables `{x}` concordent.
- **Textes des projets en anglais** : champ JSON `translations` (`{ "en": { "tagline", "description", "genre", "players", "tags" } }`).
  Les colonnes de base sont en français ; un champ non traduit retombe sur le français.
- Messages de contact et inscrits à la newsletter : tables `ContactMessage` et `Subscriber`.

## Administration (admin.ghom.fr)

Tout le contenu se gère depuis la console, sans redéployer :

- **Projets & jeux** : création, édition (FR + onglet English), ordre, publication, suppression.
- **Messages** du formulaire de contact : lus / non lus / traités, réponse par e-mail.
- **Abonnés** à la newsletter : recherche, suppression, export CSV.
- **Profil** (dossier pilote du hub) : textes FR/EN, compétences, équipement, liens, journal.
- **Traductions** : chaque texte d'interface des deux sites peut être remplacé (FR/EN) ou réinitialisé.

Les valeurs par défaut restent dans le code (`packages/content`) ; la base ne stocke que les
modifications. Après chaque enregistrement, l'admin demande aux sites de se régénérer (`/api/revalidate`,
protégé par `REVALIDATE_SECRET`) : c'est visible immédiatement.

**Premier accès** : générer le mot de passe et les secrets, puis les copier dans `.env` (dev) ou
`infra/.env.prod` (prod) :

```bash
bun --cwd apps/admin run admin:hash
```

Sécurité : session signée (cookie httpOnly, 7 jours), 5 essais par IP / 15 min, toutes les actions
revérifient la session. Changer `SESSION_SECRET` déconnecte toutes les sessions. Le Caddyfile montre
comment restreindre en plus l'accès à tes IP.

## Soutien

- `https://buymeacoffee.com/ghom` : soutenir GHOM (hub : pied de page, fiche pilote, menus).
- `https://buymeacoffee.com/nobrainnogame` : soutenir le studio (portail studio, section Studio du hub).

Définis dans `packages/content/src/funding.ts`.

## Langues

Routing i18n natif de Next.js : `app/[lang]` + `src/proxy.ts`. Toute URL sans langue (`/`) redirige vers
`/fr` ou `/en` selon le cookie `NEXT_LOCALE` (posé par le sélecteur FR / EN, partagé entre ghom.fr et ses
sous-domaines), sinon l'en-tête `Accept-Language`. Le français est la langue par défaut.

## Raccourcis

- **ghom.fr** : `1`–`4` sections · `Ctrl/⌘+K` ou `/` terminal de commande · réticule au survol
- **clic droit** (les deux sites) : menu de navigation (sections, lancer un projet / jeu, langue, sons).
  Le menu natif reste dispo dans les champs de saisie, sur une sélection de texte, ou avec `Maj + clic droit`.
- **studio** : `Entrée` = PRESS START · `↑ ↓` choisir un jeu · `Entrée` jouer · `1`–`3` stages

## Mise en production gratuite : Vercel + Neon

| Service | Rôle | Offre |
| --- | --- | --- |
| [Neon](https://neon.tech) | PostgreSQL | Free (0,5 Go, mise en veille auto) |
| [Vercel](https://vercel.com) | Les 3 apps Next.js + HTTPS | Hobby (usage personnel, non commercial) |
| OVH | DNS de `ghom.fr` | déjà payé avec le domaine |

Chaque app a un `vercel.json` (installation Bun à la racine, build Turbo filtré, région `fra1`,
build sauté si l'app n'a pas changé). Les migrations Prisma sont appliquées par le build du hub.

**1. Base Neon** — créer un projet (région *AWS Europe Central / Frankfurt*), puis récupérer deux URL
dans *Connect* : la **pooled** (`…-pooler…`) → `DATABASE_URL`, la **direct** → `DIRECT_DATABASE_URL`.

**2. Trois projets Vercel** — *Add New → Project*, importer le dépôt GitHub trois fois :

| Projet | Root Directory | Domaine |
| --- | --- | --- |
| `ghom-hub` | `apps/hub` | `ghom.fr` (+ `www.ghom.fr` → redirection) |
| `ghom-nbng` | `apps/nbng` | `nobrainnogame.ghom.fr` |
| `ghom-admin` | `apps/admin` | `admin.ghom.fr` |

Variables d'environnement (*Settings → Environment Variables*, environnement *Production*) :

| Variable | hub | nbng | admin |
| --- | :-: | :-: | :-: |
| `DATABASE_URL` (Neon pooled) | ✓ | ✓ | ✓ |
| `DIRECT_DATABASE_URL` (Neon direct) | ✓ | | |
| `NEXT_PUBLIC_ROOT_DOMAIN=ghom.fr` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_STUDIO_LABEL=nobrainnogame` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_PROTOCOL=https` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_HUB_URL=https://ghom.fr` | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_STUDIO_URL=https://nobrainnogame.ghom.fr` | ✓ | ✓ | ✓ |
| `REVALIDATE_SECRET` (même valeur partout) | ✓ | ✓ | ✓ |
| `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` | | | ✓ |
| `HUB_INTERNAL_URL=https://ghom.fr` | | | ✓ |
| `STUDIO_INTERNAL_URL=https://nobrainnogame.ghom.fr` | | | ✓ |

Les trois secrets se génèrent avec `bun --cwd apps/admin run admin:hash`.
Déployer le hub en premier (il crée les tables).

**3. DNS chez OVH** — remplacer les enregistrements par défaut de la zone `ghom.fr` par ceux que
Vercel affiche dans *Settings → Domains* (habituellement) :

| Sous-domaine | Type | Cible |
| --- | --- | --- |
| *(vide)* | A | `76.76.21.21` |
| `www` | CNAME | `cname.vercel-dns.com.` |
| `nobrainnogame` | CNAME | `cname.vercel-dns.com.` |
| `admin` | CNAME | `cname.vercel-dns.com.` |

Supprimer l'ancien A / AAAA de la racine et l'ancien `www` (page de parking OVH). Ne pas toucher aux MX.

**Projets et jeux sur leurs sous-domaines** — chaque projet est déployé à part (Vercel, Cloudflare
Pages, GitHub Pages… tous gratuits) puis relié par un CNAME chez OVH :
`ledger` → ghom.fr, `void-tactics.nobrainnogame` → jeu du studio. Pas de joker nécessaire.

## Alternative : serveur perso (Docker + Caddy)

Pour héberger toi-même sur un VPS au lieu de Vercel.

### DNS chez OVH (zone `ghom.fr`)

Avec un serveur d'IP `203.0.113.10` :

| Sous-domaine | Type | Cible |
| --- | --- | --- |
| *(vide)* | A | 203.0.113.10 |
| `www` | CNAME | ghom.fr. |
| `*` | A | 203.0.113.10 |
| `*.nobrainnogame` | A | 203.0.113.10 |

Le joker `*.ghom.fr` couvre `nobrainnogame.ghom.fr` et tous les projets perso, mais **pas** les
sous-sous-domaines : il faut donc l'entrée `*.nobrainnogame` en plus pour les jeux.
Ajoute aussi un enregistrement AAAA si ton serveur a de l'IPv6.

### Serveur

```bash
cp infra/.env.prod.example infra/.env.prod   # mets un vrai mot de passe
docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod up -d --build
# premier lancement : charger les projets
docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod run --rm \
  -w /repo/packages/db migrate bun prisma/seed.ts
```

Caddy obtient les certificats HTTPS automatiquement pour chaque hôte déclaré dans
`infra/Caddyfile`. **Pour mettre un nouveau projet ou jeu en ligne**, ajoute un bloc dans ce
fichier (reverse proxy vers son conteneur, ou `file_server` pour un jeu statique déposé dans
`infra/games/<jeu>`), puis recharge Caddy.

> Pour des certificats joker (`*.ghom.fr`) au lieu d'un certificat par hôte, il faut un Caddy
> compilé avec le module `caddy-dns/ovh` et des clés API OVH (challenge DNS).
