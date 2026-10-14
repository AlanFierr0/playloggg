# Playlogg

Playlogg lets people log games, score them, arrange personal rankings and tiers,
write reviews, import Steam libraries and compare gaming taste. Entries persist
in Supabase; the production site is https://playloggg.vercel.app.

## Current routes

| Route | Purpose |
|---|---|
| `/` | Personal home, exploration, real community recommendations and carousels |
| `/games` | Catalog filters/sorts and 25-card incremental batches |
| `/search` | Game/profile search; game logging picker |
| `/game/[slug]` | Catalog details, anonymous community average, friends' scores and reviews |
| `/log?game=[slug]` | Edit an entry; tab-local drafts survive navigation and refresh |
| `/tiers` | Owner tier board with editable ranges and queued optimistic moves |
| `/people` | Public profile directory and text search |
| `/compare` | Compare any two eligible profiles, defaulting to the owner |
| `/profile` | Owner overview, favorites, total recorded playtime, hot take and taste fingerprint |
| `/profile/ranking` | Personal order or score order, shown one view at a time |
| `/profile/reviews`, `/profile/stats` | Reviews/voting and rating/taste statistics |
| `/profile/favorites`, `/profile/social` | Manage favorites and following |
| `/profile/import/steam` | Link Steam, preview/import games, sync hours and resume imports/ratings |
| `/settings` | Names, picture, optional identity details, privacy/discovery and account deletion |
| `/u/[handle]` | Public overview with ranking/tiers/reviews/stats/favorites and entry pages |
| `/login`, `/signup`, `/reset-password` | Verified email/Steam authentication and profile setup |

Lists, quick-rate, yearly wrapped and `/profile/activity` are retired. Their legacy
pages return 404; stored lists and trusted activity records are preserved. Removed
features must not be inferred as available from historical documentation.

## Behavior

- Profiles default to public and discoverable; settings allow opting out. The testing
  account remains private. Search finds public profiles even when discovery is disabled.
- Owners edit only their own data. Public profile reads recheck visibility.
- Scores are optional whole numbers from 0 to 100. Anonymous averages use every
  supplied score, including private profiles, without a minimum rating count.
- Personal ranking follows scores unless a game has a manual position. Scores and
  favorites remain independent of manual ranking and tiers. Moves are immediate, queued
  saves coalesce, and failed drafts survive navigation/refresh in the same tab.
- Automatic tiers use editable ranges; manual exceptions remain where placed.
- Playback includes completed, in progress, backlog, shelved, currently playing,
  paused and stopped playing. Recorded hours must be nonnegative and cannot exceed
  elapsed time since known launch. Completion cannot precede launch or exceed today (UTC).
- Saving a whole entry checks its previous timestamp. Conflicting saves keep the draft
  and offer an explicit discard/reload action instead of overwriting newer information.
- Favorites do not create logs. Up to four can be featured. Unknown hours display `—`;
  playtime totals include the number of entries with recorded hours.
- Reviews are original text with clickable HTTP/HTTPS sources. Helpful votes are
  upvotes minus downvotes. Changing review text clears its votes; other edits keep them.
  Automatic English/Spanish review translation is active; translated reviews include a notice and Show original.
- Steam import opens ratings for all selected games directly, imports them in batches and keeps
  existing logs. Rating order is descending playtime. Import queues and rating sessions
  are saved per profile in this browser. Leaving pauses work; Resume import retries
  safely when returning. Nothing runs while the browser is closed.
- Playback choices distinguish campaigns from ongoing online games using catalog metadata.
  Users can switch groups; manual group preferences are remembered per profile/game in this browser.
- Played platforms include Nintendo consoles/handhelds, Sega, mobile and browser.
  Completion statistics exclude ongoing statuses and show a separate ongoing summary.
- English/Spanish (Argentina), light/dark themes, keyboard access and reduced motion
  are supported. Profile/account/search/compare pages remain noindex.

## Development

Use the pnpm version pinned in package.json. Install with `corepack pnpm install`.
Configure ignored `.env.local` using the environment variable names in `.env.example`.
The Supabase URL/publishable key are public configuration; service-role, Steam and
IGDB credentials stay server-only. Never commit credentials.

```text
corepack pnpm dev
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm exec playwright test
corepack pnpm build
```

Browser tests use an isolated loopback fixture, not production accounts or data.
Production build bootstrap may import approved catalog metadata when configured;
local/preview builds skip that operation. Catalog imports never invent user scores.

## Structure and operations

- src/app: Next.js routes. src/components: UI. src/lib: shared domain/server helpers.
- src/types/database.ts: generated schema types, with nullable RPC argument annotations.
- supabase/migrations: versioned database changes; preserve ownership and RLS.
- e2e and scripts/test-*.mjs: browser scenarios and domain/server tests.
- design-reference: untouched original design data. src/data: sample/test fixtures.
- TODO.md: pending work. AGENTS.md: current development/product rules.
- docs: implementation history and operation notes; older feature descriptions are
  historical unless reflected in this README and current AGENTS.md.

Production deploys from GitHub main to Vercel. Verify changes before routine pushes
and deployment. Do not reset infrastructure or delete user data as part of routine
maintenance. Owners can export logs, rankings, ranges and favorites as JSON or CSV from Settings.
Recovery instructions and the isolated rehearsal are in `docs/data-recovery.md`.
Production off-site backup scheduling is not configured or promised by the application.
