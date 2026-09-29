# Read-only backend

Status: user approved and applied to the existing Supabase project.
Recorded migration: `20260928224705_create_read_only_portfolio`.

## Confirmed scope

- Use sample data in the existing Supabase project.
- Public reads first; authentication and application writes remain deferred.
- Preserve the exported visual design and existing independently selected tiers.
- All people use the same profile/game/rating model.
- Inspect before changing infrastructure and track database changes in Git.

## Applied schema

| Table | Fields and constraints |
| --- | --- |
| `profiles` | Numeric identity `id`; unique `handle`; `display_name`; nullable `avatar_url`; `is_public` default false; `is_sample` default false; timestamps. Explicitly publish sample profiles when seeding. |
| `games` | Numeric identity `id`; unique `slug`; `title`; `cover_url`; nullable `release_year`; `search_keywords`; `is_sample` default false; timestamps. Personal scores do not belong here. |
| `ratings` | `profile_id` and `game_id` foreign keys, together the primary key; integer `score` constrained to 0–100; nullable independent `tier` constrained to S/A/B/C/D/F; nullable `review`; timestamps. One current rating/review per profile/game. |

Use restrictive foreign-key deletion behavior initially. Deleting a game or
profile should not silently delete its ratings. The user chose score-based
ordering: score descending, then game slug ascending for deterministic ties.
Auth ownership, favorites, lists, game API identifiers and other metadata can be
added through separate reviewed migrations when their requirements are settled.

Enable RLS on all three tables and grant only SELECT to public application roles.
Public readers see published profiles and their ratings, plus the game catalog.
Explicitly revoke application write privileges on these tables. Administrator
migration/seed access is separate from the application's publishable key.
Index `ratings.game_id`; the composite primary key already starts with profile ID.
No public write policies, privileged RPC functions or authentication changes.

## Approved sample seed and source conflicts

Seed the existing 32-game catalog, one fictional sample profile (Alex Vance),
and one rating for each game. All games and the profile are marked as samples.
Do not seed the public-figure comparison profile in this first milestone. Its
current screen remains illustrative until comparison data is agreed separately.

The source screens cannot all represent one current rating per profile/game:

| Game | Profile/catalog score | Tier-board score | Search score |
| --- | --- | --- | --- |
| Elden Ring | 98 | 97 | — |
| Baldur's Gate 3 | 97 | 96 | — |
| Disco Elysium | 94 | 97 | — |
| Alan Wake 2 | 92 | 89 | — |
| Hades | 92 | 93 | — |
| Bloodborne | 91 | 92 | — |
| Cyberpunk 2077 | 95 | — | 78 |

Approved policy: use the personal profile scores for its eight displayed games,
then the tier-board scores for other games, followed by the remaining catalog
entries. Copy explicitly displayed tiers independently; leave absent tiers null
instead of computing them from scores. Half-Life 2 has no explicit tier and
therefore has a null tier. Cyberpunk's score of 95 and explicit search tier B
are intentionally independent. Reviews are initially null; a temporary draft
does not become a published review merely because it appears on the log screen.

The catalog also mistakenly extracted `2077` from Cyberpunk's title as a release
year. Search/comparison show 2020, while the profile shows 2023. Disco Elysium
also has conflicting years (2021 on the profile, 2019 on the tier board).
Approved policy: keep disputed release years null in the initial database seed
until a metadata policy is agreed. The existing visual prototype is unchanged.
Conflicting cover variants need not be replaced: retain their existing per-screen
presentation assets while using the catalog's current cover as the database value.

## Files and repeatability

- `supabase/config.toml`: official CLI-generated local development configuration,
  targeting PostgreSQL 17. It has not been pushed to remote infrastructure.
- `supabase/migrations/20260928224705_create_read_only_portfolio.sql`: applied schema,
  grants and policies. Created with the CLI, then its filename was aligned to the
  version recorded by the plugin. Remote migration history was not rewritten.
- `supabase/demo-data.json`: versioned, reconciled sample metadata and ratings.
- `supabase/seed.sql`: generated, transactional demo seed. Resolves IDs by handle
  and slug; reruns insert missing records without overwriting existing ones.
  It refuses to seed over a matching non-sample profile or game.
- `scripts/generate-demo-seed.mjs`: rebuild the seed; `--check` verifies parity.
- `supabase/tests/read_only_portfolio.sql`: administrative verification using a
  rolled-back transaction. Its exact fixture-count assertions target this initial
  demo dataset; revise them intentionally when the seed scope changes.
- `src/types/database.ts`: generated types matching the remote schema.

The plugin applied the schema migration and executed the separate approved seed.
Applying schema migrations does not automatically load the remote demo seed;
remote seeding remains an explicit approved administrative action.
CLI and plugin authentication are separate. A full local database replay requires
Docker, which is not available in this workspace. No remote reset was run.

## Verification completed

- Public API: 32 games, one profile and 32 ratings are readable.
- Public POST, PATCH and DELETE probes against profiles were rejected.
- SQL checks confirm both application roles have SELECT only on all three tables.
- Invalid scores/tiers, duplicate ratings and missing-game references are rejected.
- Independent score/tier combinations work, and unpublished profiles/ratings stay
  hidden from anonymous and authenticated readers.
- Rerunning the seed leaves row counts and canonical scores intact.
- Test profiles and temporary edits were rolled back; no test rows remain.
- TypeScript, lint and seed reproducibility checks pass.
- Security advisors report no findings. Performance advisors initially reported
  the newly created game lookup index as unused; it is retained for foreign-key
  lookups and future game-detail queries. See the
  [unused-index advisor](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

## Read-only screen integration

The user approved replacing illustrative totals and averages with calculated
values on the sample profile. Profile rankings, the tier board and search now
consume the same server-loaded portfolio as game detail and rating drafts.

- Rankings include rated games only, ordered by score descending, then slug.
  Filters use the displayed 90+ and 75+ thresholds. Pagination shows eight
  records per page and resets when a filter changes.
- Counts and the average come from that profile's loaded ratings, including
  score zero. An empty profile displays zero rated games and no average.
- Tier groups use saved assignments independently of scores. Ratings with no
  tier appear in an Unassigned group. Tier counts match the actual groups;
  score-range labels and invented overflow counts have been removed.
- Search uses the loaded game catalog and published sample profile. Unrated
  games remain searchable and display an explicit unrated state. It does not
  advertise fixture profiles or nonexistent curated lists as database results.
- Original per-screen cover variants are retained in
  `src/data/portfolio-art.json`; games without an original variant use their
  catalog cover. Layout, typography, navigation and tier colors are preserved.
- Game detail labels its score as the sample profile's rating; community and
  editorial material remains illustrative. Draft tiers initialize and reset
  to the saved tier, including no assignment. Draft editing stays memory-only.
- Root and route errors show a retry control, without replacing unavailable
  database data with fixture results. The query layer still has a 1,000-row
  limit per resource; server pagination is a future requirement for a larger
  catalog. Current sample data is within this limit.

## Integration verification

Integration verification: TypeScript and lint pass; five data-rule tests and
seed reproducibility pass. The browser confirms 32 sample ratings and an 80.6
average, working pagination/filter reset, tier counts matching Supabase,
keyboard search navigation and draft reset to an unassigned tier. Desktop and
390px mobile layouts were inspected with no horizontal overflow. An isolated
local API verified failed-read recovery through the retry control, searchable
unrated titles and an empty profile without a fabricated average. Local
environment settings were restored; these checks did not alter Supabase data.

## Next milestone

The user authorized merging the read-only integration into `main` and using
`main` directly for ongoing work. Production deployment follows pushes to that
branch. The user subsequently approved owner-only access and email magic links.
That milestone is implemented under the separately documented
[ownership/access design](owner-persistence.md). The migration is applied and
production rollout is complete. The owner account/profile is provisioned and
the user confirmed production magic-link sign-in. A first production save remains
to be verified. The proposed next milestone is persistent playback status and
a real Backlog; whether entries can be unrated is awaiting the user's decision.
Comparison and discovery remain illustrative screens; curated lists, playback
status, community statistics and editorial reviews have no persistence yet.
