# Playlogg

A gaming portfolio prototype based on the original Google Stitch exports.
The first milestone preserves the seven screen designs and connects navigation
and temporary browser interactions. All people use the same profile concepts.

## Local development

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
| `/log` | Temporary rating/review draft |
| `/game/[slug]` | Game detail using the existing detail-page layout |

Search supports sample game matching, result categories, arrow keys, Enter,
Escape and modal focus trapping. “Switch Game” opens search in rating mode.
Score and tier are independently editable. Platform, playback status and review
fields are temporary controls. Refresh restores the original defaults.

Drafts do not update profile/ranking fixtures. “Commit to Log” explains that
nothing is saved or broadcast. Unsupported visual controls display a prototype
notice. Comparison metrics, pagination, counts, public-figure profiles and
reviews are illustrative content from Stitch, not factual application data.

## Structure and design

- `src/app`: App Router pages, shared layout and metadata.
- `src/components`: shared navigation, feedback, controls and screen components.
- `src/data`: clearly identified sample fixtures, including 32 game entries.
- `src/types`: frontend types; these do not establish a database schema.
- `design-reference`: original unmodified exports and screenshots.
- `AGENTS.md`: durable development rules and product decisions.

The user approved the HTML values when they conflict with `DESIGN.md` for this
prototype. Ask again about any newly encountered conflict or visible design
change. The tier and comparison screenshots are failed exports containing error
text; their original HTML remains available. Fonts and artwork still use the
original external URLs. No game-data API has been integrated.

The sample data can disagree across original screens. Those original displayed
values are retained for visual fidelity; they must be reconciled before real
ratings, statistics or comparison calculations are implemented. Metadata that
is absent from the source is not researched or invented for this milestone.

## Infrastructure

The prototype is published from GitHub `main` at https://playloggg.vercel.app/.
Use the Next.js preset on Vercel. The recommended package-manager setting is
Corepack (`ENABLE_EXPERIMENTAL_COREPACK=1`) to respect the pinned pnpm version;
verify the version in Vercel's install logs.

A new Supabase project exists. Its URL and publishable key are configured in
ignored local `.env.local` using `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The current prototype does not query
Supabase and can run without these variables. A service health check succeeded;
that alone does not verify database tables or access policies.

Authenticated Supabase plugin inspection confirmed the project is healthy in
`us-east-1` (North Virginia, within Americas). The approved `profiles`, `games` and
`ratings` schema is now applied, with 32 sample games, one sample profile and
32 ratings. Public reads and blocked writes have been verified. The security
advisor reported no findings.

The first backend stage provides public read-only data. The current UI still uses
fixtures; connecting it is a separate milestone. Authentication remains deferred.
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
