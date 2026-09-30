# Playlogg

A gaming portfolio based on the original Google Stitch exports. People can keep
private entries and curated lists, browse a shared game catalog, and optionally
publish a profile. All people use the same profile concepts; some editorial and
comparison screens still contain illustrative content.

For the current application inventory and prioritized next milestones, see the
[application review and roadmap](docs/application-roadmap.md).

## Local development

Use `main` for ongoing work, with logical commits directly on that branch.
Feature branches and pull requests are used only when explicitly requested.
Pushing `main` triggers the Vercel production deployment.

Use Node.js 22.13+ and pnpm 11.19.0 (the version pinned in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

```sh
pnpm typecheck
pnpm lint
pnpm build
pnpm start
node --experimental-strip-types --test scripts/test-portfolio-view.mjs
```

Next.js, React, strict TypeScript and Tailwind CSS 3 provide the application
foundation. Tailwind 3 preserves the export's existing utilities and theme
values. ESLint 9 is pinned because the React rules shipped with the current
Next.js ESLint configuration fail on ESLint 10's rule API.

## Application routes

| Route | Screen |
| --- | --- |
| `/` | Discover / editorial home |
| `/games` | Full saved game catalog with search, filters and pagination |
| `/profile` | Personal profile and rankings |
| `/tiers` | S–F tier board |
| `/compare` | Sample profile comparison |
| `/search` | Search overlay; Ctrl/Cmd+K also opens it |
| `/log` | Owner rating/review and playback-status editor |
| `/login` | Steam sign-in and existing owner email sign-in |
| `/signup` | Private profile name setup after first Steam sign-in |
| `/settings` | Owner profile names and optional publishing |
| `/u/[handle]`, `/u/[handle]/tiers`, `/u/[handle]/lists` | Shareable rankings, tiers and curated lists for published profiles |
| `/u/[handle]/lists/[id]`, `/u/[handle]/game/[slug]` | Public list and saved-entry details |
| `/lists`, `/lists/[id]` | Curated lists and custom game order |
| `/game/[slug]` | Game detail using the existing detail-page layout |

Search reads the public Supabase catalog and sample profile, with categories, arrow keys, Enter,
Escape and modal focus trapping. “Switch Game” opens search in rating mode.
Score and tier are independently editable. Saved owner scores, tiers, playback
status and reviews reload from Supabase. Scores are optional; zero is a real
score. Saved optional platform, playtime and completion date reload from Supabase.
Their migration is applied and production rollout is authorized; see
[saved play details](docs/saved-play-details.md). Personal tags and ordered lists
use the applied Supabase schema; production rollout is authorized. See
[tags and curated lists](docs/tags-and-curated-lists.md). Timeline broadcasting is unavailable.

“Commit to Log” saves the signed-in owner's optional score, independent tier,
playback status, play details, tags and review. It is disabled for the sample
portfolio. Nothing is broadcast. Unsupported controls are disabled and visibly labeled unavailable. Counts, averages, rankings and tiers use the selected profile.
The Backlog uses saved entries, including unscored games. Its migration is
applied and production rollout is authorized; see
[Backlog and playback status](docs/backlog-and-playback-status.md).
Comparison metrics, discovery content, public-figure profiles and editorial
reviews remain illustrative content from Stitch. Curated list visibility follows
the owning profile; list membership is independent of ratings.

## Structure and design

Layouts adapt across phones, tablets, desktop and short landscape screens while
preserving the existing style. Mobile navigation and search remain accessible;
forms, grids, typography and spacing adapt to the viewport. See
[responsive layouts](docs/responsive-layouts.md) for behavior and verification.
The header also offers light/dark and English/Español (Argentina) toggles.
Selections persist in cookies; see [display preferences](docs/display-preferences.md).
Changes merged into `main` deploy automatically through Vercel.

- `src/app`: App Router pages, shared layout and metadata.
- `src/components`: shared navigation, feedback, controls and screen components.
- `src/data`: clearly identified sample fixtures, including 32 game entries.
- `src/types`: shared frontend concepts and generated Supabase database types.
- `design-reference`: original unmodified exports and screenshots.
- `AGENTS.md`: durable development rules and product decisions.

The user approved the HTML values when they conflict with `DESIGN.md` for this
prototype. Ask again about any newly encountered conflict or visible design
change. The tier and comparison screenshots are failed exports containing error
text; their original HTML remains available. Fonts retain their original external URLs. Game imagery uses reviewed IGDB
covers/artwork, with verified box art for the two comparison-only classics.
Profile portraits use initials until a real image is supplied; generated Stitch
images are absent from the application. See [image sources](docs/image-sources.md). Reviewed sample IGDB metadata is imported through separate administrative
scripts. Owner-only in-app IGDB search/import is deployed. The owner confirmed
production credentials are configured; real owner search/import and duplicate
reuse are verified. See the
[IGDB catalog setup guide](docs/igdb-catalog-import.md). Credentials remain on
the server; public browsing reads the stored catalog without provider requests.

Original fixtures remain as design references. Connected screens use reconciled
Supabase ratings and imported catalog metadata. Game cards use the catalog cover consistently across rankings, tiers, search,
and the editor. Detail backgrounds use the selected game's artwork; missing
artwork is not invented.

## Infrastructure

Public Steam sign-in and private profile setup are deployed; real sign-in,
entry/list persistence and repeat sign-in are verified. A second Steam account
was unavailable for its isolation scenario. Each person edits only their own entries and lists; IGDB import stays
restricted to the original owner. See [Steam sign-in](docs/steam-sign-in.md).
Optional profile publishing and shareable portfolio pages are deployed. Guest
routes and signed-in publishing/unpublishing work. See
[public profiles](docs/public-profiles.md).

The prototype is published from GitHub `main` at https://playloggg.vercel.app/.
Use the Next.js preset on Vercel. The recommended package-manager setting is
Corepack (`ENABLE_EXPERIMENTAL_COREPACK=1`) to respect the pinned pnpm version;
verify the version in Vercel's install logs.

A new Supabase project exists. Its URL and publishable key are configured in
ignored local `.env.local` using `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The application requires both variables
to read public data on the server. The cloned repository does not include
local environment files. A missing configuration or failed read shows a retry
state; fixtures are not silently substituted.

Authenticated Supabase plugin inspection confirmed the project is healthy in
`us-east-1` (North Virginia, within Americas). The approved `profiles`, `games` and
`ratings` schema is now applied, with 32 sample games, one sample profile and
32 sample ratings. Public reads and owner-only writes have been verified. See
the Backlog rollout document for the current security-advisor result.

The application reads public data with the publishable key. Search, profile
rankings, calculated statistics and tiers share the loaded portfolio.
Owner sign-in and persistent entry editing are implemented. Ownership and
optional-score/status migrations are applied; the user verified production
magic-link sign-in after completing account/Auth configuration. See
[owner persistence and rollout](docs/owner-persistence.md) for the access model,
tested migration and required Auth settings. Other editing remains deferred.
See [backend setup and verification](docs/read-only-backend-proposal.md) for the
applied migration, seed rules and checks. Rebuild or verify the seed with:

```sh
node scripts/generate-demo-seed.mjs
node scripts/generate-demo-seed.mjs --check
```

Use authenticated Supabase plugin or
CLI access for schema inspection and migrations; public application credentials
are not administration credentials. Plugin authentication and CLI login are
separate.

Next.js page titles, descriptions and Open Graph metadata provide the initial
SEO foundation. Canonical URLs, production indexing settings and sitemap
configuration depend on the final domain and real content.

The Games navigation tab browses every stored catalog game, including unlogged
titles, with genre, available platform, release year and sorting controls.
Optional profile filters cover logged entries, status, tier, rating and score
range. See [Games catalog](docs/games-catalog.md) for behavior and verification.

Secrets must stay in ignored environment files, never source or documentation.
Agree on ownership and write access before exposing any database editing flow.
Track approved future database changes through versioned migrations.

Step 2 adds working Shelf/editor navigation and catalog-link copying, clear sample
labels, real personal entry cards and hidden footer placeholders. See
[visible action inventory](docs/visible-actions.md).
