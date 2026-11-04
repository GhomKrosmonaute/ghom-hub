---
name: add-project
description: Add or update a project (personal tool, studio game, library, bot…) in the GHOM catalogue through the admin console admin.ghom.fr/projets, so it shows on ghom.fr or on the No Brain No Game portal. Use when the user asks to add, list, reference, publish or edit a project/game in "les projets", "le CRM", "l'admin" or the catalogue, or to change its cover, tagline or links.
---

# Add a project to the catalogue

The catalogue lives in the database and is edited at **https://admin.ghom.fr/projets** (single
password, see README « Administration »; hash with `bun admin:hash`). Nothing to commit for a
plain entry: saving revalidates the sites (or they refresh within 60 s by ISR).

Where it shows:
- `owner = PERSONAL` → **ghom.fr** (hub).
- `owner = STUDIO` → **nobrainnogame.ghom.fr** (studio portal; games also get the
  « Select your game » screen).

## 1. Gather the facts first (never invent them)

From the project's repo and the web, not from memory:
- name, one-line tagline, short description (2–4 sentences, concrete), **FR and EN**
  (reuse the project's own landing/README wording when it exists);
- year (repo `created_at`), stack, tags, source URL, docs/live URL;
- for a game: genre, players, platforms.

```bash
export GH_TOKEN=$(gh auth token --user GhomKrosmonaute)   # see "GitHub identity" below
gh api repos/<owner>/<repo> --jq '{created_at,stargazers_count,description,homepage,topics}'
gh api repos/<owner>/<repo>/readme --jq .content | base64 -d | head -80
```

Ask the user only for real choices: **featured or not**, and the status when it is not obvious.

## 2. Fill the form (`/projets/nouveau`, or `/projets/<id>` to edit)

| Tab | Field | Notes |
|---|---|---|
| Général | Nom, Slug | slug = kebab-case, unique |
| | Accroche (FR), Description (FR), Tags (FR) | French is the default language |
| | Propriétaire | `Perso · ghom.fr` (PERSONAL) or `Studio · No Brain No Game` (STUDIO) |
| | Type | App web, Site, Jeu vidéo, Outil, Librairie, Bot, Divers |
| | Statut | En ligne (LIVE), Bêta, En développement, Prototype, Archivé |
| | Année, Ordre, Couleur néon | colour `#rrggbb`: take the project's own brand colour |
| | Stack | comma-separated |
| | Publié / Mis en avant | published by default; **featured only if the user says so** |
| | Jouable | games only: tick it as soon as the game can be launched in the browser, **whatever its status** (a prototype counts). Drives the « Jouables » counters (hub and studio) and the Play button; status no longer does |
| Liens | Sous-domaine | label only (`devgame`). Becomes `<label>.ghom.fr` (PERSONAL) or `<label>.nobrainnogame.ghom.fr` (STUDIO). Reserved: `www api admin mail nobrainnogame`. **Takes priority over URL externe.** |
| | URL externe | used only without a subdomain (docs, store page…) |
| | Code source, Visuel | |
| Jeu | Genre, Joueurs, Plateformes | studio games only |
| English | name (only if different), tagline, description, genre, players, tags | empty = French text shown |

### Cover image (« Visuel »)

Only the **studio portal** displays covers (`game-select.tsx`, cropped `object-cover` to
**2:1 from the centre**); ghom.fr draws a generated glyph instead, so skip covers for
personal projects. Host covers in this repo, never hotlink:

```bash
magick <source.png> -strip -quality 88 apps/nbng/public/covers/<slug>.webp
git add apps/nbng/public/covers/<slug>.webp && git commit -m "<Name> cover on the studio portal" && git push
# once Vercel « nobrainnogame » is deployed:
curl -sI https://nobrainnogame.ghom.fr/covers/<slug>.webp   # 200 image/webp
```

Then set « Visuel » to `https://nobrainnogame.ghom.fr/covers/<slug>.webp`.

## 3. Driving the form from the browser (claudecodebrowser)

The admin uses Radix/shadcn; plain `.value =` does not register. In `browser_execute_script`:
- text inputs/textarea: native setter (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set`)
  then dispatch `input`, `change`, `blur`; fields are found by `[name="tagline"]`,
  `[name="translations.en.tagline"]`, `[name="subdomain"]`…
- selects (`button[role=combobox]`, order: owner, type, status): dispatch `pointerdown`
  then `click`, wait, click the `[role=option]` whose text starts with the label;
- tabs (`[role=tab]`): `pointerdown` + `mousedown` + `click`;
- submit: button `CRÉER` (new) or `ENREGISTRER` (edit); read `[data-sonner-toast]` and
  `[id$=form-item-message]` for errors.

## 4. Verify, then report

```bash
curl -s https://nobrainnogame.ghom.fr | grep -c '<tagline FR>'     # studio, FR has no prefix
curl -s https://nobrainnogame.ghom.fr/en | grep -c '<tagline EN>'
curl -s https://ghom.fr | grep -c '<Name>'                          # personal
```

A toast « … HUB N'A PAS PU ÊTRE RAFRAÎCHI … 60 S » is the hub revalidation call failing
(admin env `HUB_INTERNAL_URL` / `REVALIDATE_SECRET`): the save worked, ISR catches up.

Report the values used in a table, and say what was left for the user to decide
(featured, status).

## GitHub identity

This is a **GhomKrosmonaute / NoBrainNoGame** project, never `camille-aka-ghom`. The active
`gh` account on this machine may be `camille-aka-ghom` (no rights): do not switch it,
prefix commands with `GH_TOKEN=$(gh auth token --user GhomKrosmonaute)`. Commit as
`Ghom <19586013+GhomKrosmonaute@users.noreply.github.com>`.
