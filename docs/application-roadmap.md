# Playlogg application review and roadmap

The seven launch milestones below are implemented. The current product roadmap
is [Playlogg: your gaming identity](product-identity-roadmap.md), supplied by the
user after Step 7. The proposed backup/recovery Step 8 was cancelled; operations
follow-ups remain deferred rather than the next development milestone.

Reviewed 2026-09-30 at `main` commit `523080d`. This is a snapshot of the
implemented application and a recommended order of work, not a claim that every
signed-in production journey has been exercised. Anonymous production `HEAD`
checks returned 200 for `/`, `/games`, `/profile`, `/tiers`, `/lists`, `/compare`,
`/u/alexvance`, and `/login`. The light/dark and English/Español (Argentina)
controls were also checked in the live browser across navigation and reload.

## What exists today

| Area | Current behavior | Source of truth |
| --- | --- | --- |
| Public entry | Discover shows a curated hero and game cards. Guests can browse the catalog, search, rankings, tiers, lists, game details, and published-profile comparisons. | `src/app`, `src/components/screens` |
| Accounts | Steam OpenID signs people into separate Supabase accounts and guides new users through private profile setup. The original owner also has email magic-link sign-in. | `src/app/auth`, `src/app/login`, `src/app/signup`, [Steam flow](steam-sign-in.md) |
| Personal portfolio | Signed-in people can save one entry per game: optional score, independent tier, playback status, platform, hours, completion date, review, and tags. Rankings, averages, Backlog, and tiers read those entries. | `src/app/actions/ratings.ts`, `src/lib/portfolio.ts`, [entry behavior](backlog-and-playback-status.md) |
| Catalog | `/games` browses stored Supabase games with search, genre, platform, year, personal-entry filters, sort, and 24-card pages. Only the original owner can search IGDB and import new shared games. | `src/components/screens/games-screen.tsx`, [catalog](games-catalog.md), [IGDB import](igdb-catalog-import.md) |
| Lists | People can make ordered curated lists, add catalog games, and save tags. Lists follow the profile's visibility; list membership does not create a rating. | `src/app/actions/collections.ts`, [lists](tags-and-curated-lists.md) |
| Sharing | A profile starts private. Its owner can edit names and publish it, making rankings, tiers, entries, and lists readable at `/u/[handle]`. | `src/app/actions/profile.ts`, `src/lib/public-portfolio.ts`, [public profiles](public-profiles.md) |
| Display | Responsive layouts, reviewed game imagery, light/dark mode, and English/Español (Argentina) controls are deployed. Theme and language choices persist in cookies. | [responsive layouts](responsive-layouts.md), [display preferences](display-preferences.md) |
| Platform | Next.js 16/React 19/Tailwind 3 on Vercel from GitHub `main`; Supabase Auth, Postgres, RLS, and versioned migrations; server-side IGDB access. | `package.json`, `supabase/migrations`, `AGENTS.md` |

The published Alex Vance profile and 32-game initial seed are identified sample
content. New Steam profiles start empty. Discover now uses curated catalog data. Invented community sections and unavailable
controls on original game pages and the tier board are hidden. Shelf opens the existing editor (guests sign in first), and Share copies a catalog
URL without publishing a profile. Remaining prototype controls are disabled and
labeled unavailable; footer API/Terms/Privacy placeholders are hidden.
Imported games use real catalog metadata and do not inherit the sample editorial
claims. [README.md](../README.md) lists the routes and existing rollout notes.

## Original review gaps and current status

The findings below describe the initial review. Steps 2-7 now address the sample
controls/comparison, localization, catalog scaling, launch metadata and repeatable
fixture coverage. The second Steam identity check, fatal-layout preference
hydration and operational backup/restore setup remain follow-ups.

1. **Production acceptance has one remaining account scenario.** Real Steam
   sign-in/persistence, owner IGDB import and publish/unpublish passed on 2026-09-30.
   Isolation was checked between the Steam and email-owner accounts; two Steam
   identities remain untested because a second account was unavailable. See the
   [acceptance report](production-acceptance.md).
2. **Illustrative screens can look like live data.** Compare displays fixed people,
   scores, and affinity numbers. Discover and prototype detail pages also retain
   editorial/sample content. Step 2 now labels these sections prominently and renders the selected
   profile's real saved entry separately; replacing sample content remains future work.
3. **The fatal root-layout fallback uses default preferences initially.** Ordinary
   pages now render Spanish UI and metadata on the server. If the root layout
   itself fails, Next’s client global-error screen reads cookie preferences after
   hydration. See [display preferences](display-preferences.md).
4. **Catalog growth will stress the current page model.** The root portfolio loads
   the full shared catalog into its client provider on every route. Selected-profile
   rating reads are capped at 1,000 entries in `getPortfolio`, while the public portfolio
   already paginates. `/games` filters and page number reset when the component
   remounts because they live only in local state.
5. **Public-facing polish is unfinished.** Footer API/Terms/Privacy are preview
   controls; its copyright year is fixed at 2025. Several page descriptions still
   call the current app a prototype or sample. The README identifies canonical
   URLs, sitemap, and indexing policy as future work.
6. **Regression coverage is uneven.** Input, data, and security logic have Node
   tests plus historical browser checks, but there is no repeatable end-to-end
   production acceptance suite for real sign-in, private/public transitions,
   import, and saved-entry reload. Do not use real owner records as disposable test
   fixtures.

## Recommended step-by-step sequence

Each step should become a small, reviewable milestone on `main`. For code changes,
run the relevant Node tests, `pnpm typecheck`, `pnpm lint`, and `pnpm build`; verify
the affected browser routes at phone and desktop widths before relying on the
automatic Vercel deployment. Preserve the approved visual design and RLS model.

### 1. Close the production acceptance gaps

Track observed results and pending checks in [production acceptance](production-acceptance.md).

1. Verify a real Steam sign-in, private profile setup, sign-out, repeat sign-in,
   saved unscored Backlog entry, and list reload. Use a second account to check
   isolation. Record only outcomes, never credentials or tokens.
2. With the original owner account, search IGDB, import a previously absent game,
   confirm its edition/cover, log it, and confirm a second import reuses the same
   catalog row. Check that another Steam account cannot import.
3. Publish a test profile, check its public entry and list as a guest, unpublish,
   and confirm all nested pages return the same 404 as an unknown handle. Test name
   changes and the resulting URL change.
4. Record failures with the exact route and deployment, fix them, and repeat the
   affected journey. Completion means the feature rollout notes in the
   [Steam](steam-sign-in.md), [IGDB](igdb-catalog-import.md), and [public profile](public-profiles.md)
   documents can be updated from observed production behavior.

### 2. Make every visible action and claim honest

Implemented 2026-09-30. See [action inventory and verification](visible-actions.md).
Step 3 adds repeatable fixture journeys; step 1's second-Steam-account check
remains pending.

1. Inventory `PreviewAction` controls and hard-coded numbers/copy in Discover,
   Compare, game details, and the footer. Keep a prominent sample label where
   sample content remains, and prevent illustrative metrics from appearing to be
   the signed-in person's data.
2. Turn high-value controls such as Shelf and Share into real, permission-aware
   actions or present them clearly as unavailable. Resolve footer links and the
   fixed copyright year. Terms/Privacy copy needs the site owner's approved text;
   do not invent a policy.
3. Completion means a guest and a signed-in user can distinguish sample content,
   personal data, and actions that actually save or share. Preserve the current
   design unless a specific visual change is agreed first.

### 3. Add repeatable journey checks before larger features

Implemented with local fixtures approved by the user. See
[journey suite, isolation and post-deploy checklist](journey-tests.md).
Step 4 implements explicit localization and accessibility. Steps 5 and 6 implement catalog growth and real comparisons; step 7 completes the launch details.

1. Keep existing unit/data/RLS tests, then add a small deterministic browser suite
   for guest catalog/search, theme/language persistence, mobile navigation, and
   an isolated authenticated save/reload flow. Exercise private/public 404 rules
   with controlled fixtures; keep real Auth accounts and production ratings out of
   destructive tests.
2. Run the suite in CI on `main` with safe environment configuration, and capture
   deployment/build failures and key server errors. Define a short post-deploy
   smoke checklist for anonymous routes and one controlled signed-in account.
3. Completion means each push reports a clear pass/fail signal and a failed
   protected journey can be reproduced without altering another user's data.

### 4. Make localization and accessibility first-class

Implemented using the existing dictionary, unchanged URLs and cookie preferences.
See [translation approach, accessibility checks and fallback limitation](display-preferences.md).

1. Replace broad DOM text mutation with explicit UI messages rendered by React
   and the server. Include titles/descriptions, form errors, live status messages,
   and dynamic counts. Keep game titles, company names, and user content in their
   source language. Retain the existing URLs unless a locale-URL decision is made.
2. Audit both themes and both languages across all routes for contrast, keyboard
   focus, screen-reader names, mobile navigation, dialogs, and reduced motion.
3. Completion means a cold Spanish response has Spanish UI and metadata with no
   English flash, and switching language/theme does not alter filter values or
   user-authored content.

### 5. Prepare the catalog and profiles for growth

Implemented with the approved server-filtered 24-card pages. See
[catalog growth, payload estimates and remaining limits](catalog-growth.md).

1. Remove the 1,000-rating truncation for selected profiles, using paginated
   reads and tests above that boundary. Keep public/private access checks intact.
2. Measure payload and request cost with hundreds/thousands of games. Avoid
   sending the whole catalog to routes that do not need it; choose server-backed
   filtering/pagination when measured scale warrants it. Keep scores and tiers
   attached to the selected profile only.
3. Put Games filters and page in the URL so search results can be shared and a
   Back/Forward or reload retains the view. Test invalid query values and empty
   results. Completion means large catalogs remain usable without losing entries
   or filter state.

### 6. Replace the illustrative comparison with real profile comparison

Implemented with published handles, shared logged entries, independent tiers and
a five-scored-game minimum for affinity. See [comparison rules and privacy](profile-comparison.md).

1. Agree on which published profiles can be compared and how people select them.
   Do not expose private accounts through search or suggestions. Decide how to
   handle unrated games and define the affinity formula before displaying a
   percentage; scores and independent tiers must remain distinct.
2. Compute shared rated games and meaningful differences from actual saved
   entries. Add empty/small-overlap states, direct links to public profiles, and
   tests for privacy, zero scores, missing tiers, and score ties.
3. Remove the fixed Hideo Kojima/Alex Vance comparison numbers. Completion means
   every displayed statistic can be traced to the two selected published
   portfolios. This step depends on product decisions above and step 5's scale
   work if the catalog has grown.

### 7. Finish discovery and public launch details

Implemented with curated catalog data, the existing Vercel domain, catalog-only
indexing and no profile directory. See [launch behavior](public-launch.md) and
[data operations plan](data-operations.md). Backup scheduling and an isolated
restore drill remain operational follow-ups; no self-service export/delete UI
or retention policy is promised.

1. Decide whether Discover remains a deliberately curated editorial page or
   should show personal/catalog-driven sections. If people need to discover other
   profiles, make directory inclusion a separate opt-in choice rather than
   assuming publication implies discoverability.
2. Set the final domain/indexing policy; add canonical links, sitemap/robots,
   and accurate share metadata only for public content. Keep private profiles and
   account pages out of indexing. Add a practical data export/deletion and backup
   plan before promising those actions in the UI.
3. Recheck responsive layouts, accessible sharing, error states, and real data
   across both locales. Completion means a new visitor can understand the app,
   create a private profile, log a game, choose to publish, and share a truthful
   public page without encountering a prototype control.

## Decisions to ask before implementing the affected step

- **Step 2 (agreed):** Shelf uses the editor, Share copies a catalog URL, and
  API/Terms/Privacy placeholders stay hidden.
- **Step 4 (agreed):** Keep the existing dictionary, cookie preferences and URLs,
  with explicit React/server translations and no runtime i18n dependency.
- **Step 5 (agreed):** Server-filtered Games pages with 24 cards and URL filters.
- **Step 6 (agreed):** Two published handles; affinity is 100 minus mean absolute
  score difference with at least five shared scored games. Include shared unrated
  entries, with tiers compared separately.
- **Step 7 (agreed):** Curated catalog-based Discover; no profile directory;
  existing Vercel domain with indexing only for Discover/catalog/game details.
  Hide invented community sections and unavailable controls while preserving layouts.

Step 1's available-account flows are verified in the acceptance report; the
second-Steam scenario remains pending. The seven application milestones are implemented. Next is Phase 1 of the
[product identity roadmap](product-identity-roadmap.md), starting with Profile v2
and independent favorites.
