# Playlogg

A gaming portfolio prototype based on the original Google Stitch exports.
The first milestone preserves the seven screen designs and connects navigation
and temporary browser interactions. All people use the same profile concepts.

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

## Prototype routes

| Route | Screen |
| --- | --- |
| `/` | Discover / editorial home |
| `/profile` | Personal profile and rankings |
| `/tiers` | S–F tier board |
| `/compare` | Sample profile comparison |
| `/search` | Search overlay; Ctrl/Cmd+K also opens it |
| `/log` | Owner rating/review and playback-status editor |
| `/login` | Owner email magic-link sign-in |
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
[tags and curated lists](docs/tags-and-curated-lists.md). Broadcast remains temporary.

“Commit to Log” saves the signed-in owner's optional score, independent tier,
playback status, play details, tags and review. It is disabled for the sample
portfolio. Nothing is broadcast. Unsupported controls display
a prototype notice. Counts, averages, rankings and tiers use the selected profile.
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
scripts. Owner-only in-app IGDB search/import is implemented locally; activation
requires server credentials and production rollout. See the
[IGDB catalog setup guide](docs/igdb-catalog-import.md). Credentials remain on
the server; public browsing reads the stored catalog without provider requests.

Original fixtures remain as design references. Connected screens use reconciled
Supabase ratings and imported catalog metadata. Game cards use the catalog cover consistently across rankings, tiers, search,
and the editor. Detail backgrounds use the selected game's artwork; missing
artwork is not invented.

## Infrastructure

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

Secrets must stay in ignored environment files, never source or documentation.
Agree on ownership and write access before exposing any database editing flow.
Track approved future database changes through versioned migrations.
