# Profile v2: gaming identity

The user approved unlimited independent favorites with an ordered featured Top 4,
optional bio/location/platform preference, and initials instead of image uploads.
A catalog game can be a favorite without a rating or playback status.

## Behavior

- `/profile` is the selected portfolio Overview; guests still see the identified
  sample profile, and signed-in owners see their own profile.
- `/u/[handle]` is the published Overview. Private/unknown handles and their
  nested pages continue to return the same 404 through fresh anonymous reads.
- Both views show real rated/completed counts, scored-game average, favorite
  count, featured cover art, recent entry updates, reviews and curated lists.
  No favorites or personal entries are generated for existing profiles.
- `/profile/favorites` lets owners browse/search the catalog, add/remove favorites
  and assign positions 1-4. Views paginate 24 cards; database reads paginate so
  favorites above 1,000 are not dropped. The published equivalent is read-only.
- Replacing a featured position removes the previous game's featured position,
  retaining it as a regular favorite. Removing a favorite leaves ratings, tiers,
  reviews and statuses unchanged. Positions are optional; gaps are displayed
  honestly rather than filled with highest-scored games.
- Settings save bio (up to 500 characters), optional location (80) and a free-text
  platform preference (80). Blank values become null. These fields follow profile
  visibility and are rendered as user content, without translation or HTML.

## Navigation and truthful statistics

Main navigation is Discover, Games, Profile and Compare. Profile navigation has
Overview, Ranking, Tier List, Lists, Reviews and Stats. Existing tier/list URLs
remain valid; rankings now have their own `/profile/ranking` and public equivalent.

Ranking remains score descending with slug tie-breaking, explicitly labeled as
score ordering. Independent preference ordering and pairwise calibration are later
work; neither favorites nor tiers are derived from scores.

Recently updated entries use the stored entry `updated_at`, displayed as a UTC
calendar date. This is not an event log or original rating date: any saved rating,
review or playback edit may change it. Missing dates are omitted. Reviews show
current saved reviews; no historical tier/favorite events are fabricated.

Stats currently provides portfolio counts/average and the requested score bands:
0-49, 50-59, 60-69, 70-79, 80-89, 90-100. Percentages use scored games only; zero
counts as scored and null does not. Genre/studio identity labels, taste fingerprint
and behavioral statistics remain Phase 2 work with formulas still to agree.

## Persistence and access

Applied migrations:

- `20261001172814_profile_identity_favorites.sql`: optional profile fields and
  `profile_favorites`, independent from `ratings`.
- `20261001173343_profile_identity_read_access.sql`: column-specific reads for
  the optional identity fields through existing profile RLS.

Favorites are keyed by profile/game, with unique optional featured positions 1-4.
Public reads require publication; personal reads/writes require the Auth owner's
non-sample profile. Anonymous writes are denied. The invoker RPC derives the
profile from Auth and atomically applies a featured-position change under a
per-profile transaction lock. It does not use an admin client or trust a submitted
profile ID. Profile identity writes reuse the existing ownership-scoped,
field-whitelisted server admin action; no profile write grant is added.

Public reads recheck publication after collecting ratings, lists and favorites.
Profiles and all sections remain noindex, outside the sitemap and outside any
profile directory. No social feature or discoverability consent is inferred.

## Verification

`supabase/tests/profile_identity_favorites.sql` verifies ownership, public/private
reads, atomic displacement, invalid-save rollback and rating independence with
temporary identities. All writes roll back; no real user's portfolio is modified.

Node tests cover field validation, forged inputs, verified-account actions, scoped
pagination above 1,000 and existing portfolio/privacy behavior. Browser fixtures
exercise owner edits, unlogged favorites, featured position changes, reload,
failed saves, publication/unpublication, reviews, zero scores and section links.
Accessibility checks cover both themes/locales at desktop/mobile widths. Visual
checks also cover a 768px tablet viewport. Real Steam provider checks remain the
separate earlier acceptance report.

Avatar/banner uploads, quick rating, independent ranking, taste fingerprint,
community discovery and social activity histories are subsequent milestones.

Local verification passed: all 63 Node tests, TypeScript, lint and the production
build. All 44 browser scenarios passed across the full run and the corrected
favorites-test rerun (42 in the full run; all four Profile v2 checks on rerun).
The test correction searches for titles rather than assuming their catalog page.
The live database rollback test passed and confirmed zero leftover fixture users
or profiles. No new database security advisor findings were introduced.
