# Read-only backend proposal

Status: proposed for user review, not an approved schema or applied migration.

## Confirmed scope

- Use sample data in the existing Supabase project.
- Public reads first; authentication and application writes remain deferred.
- Preserve the exported visual design and existing independently selected tiers.
- All people use the same profile/game/rating model.
- Inspect before changing infrastructure and track database changes in Git.

## Proposed first migration

| Table | Proposed fields and constraints |
| --- | --- |
| `profiles` | Numeric identity `id`; unique `handle`; `display_name`; nullable `avatar_url`; `is_public` default false; `is_sample` default false; timestamps. Explicitly publish sample profiles when seeding. |
| `games` | Numeric identity `id`; unique `slug`; `title`; `cover_url`; nullable `release_year`; `search_keywords`; `is_sample` default false; timestamps. Personal scores do not belong here. |
| `ratings` | `profile_id` and `game_id` foreign keys, together the primary key; integer `score` constrained to 0–100; nullable independent `tier` constrained to S/A/B/C/D/F; nullable `review`; timestamps. One current rating/review per profile/game. |

Use restrictive foreign-key deletion behavior initially. Deleting a game or
profile should not silently delete its ratings. Ranking order is a pending
product decision: score-based ordering or independently stored manual positions.
Auth ownership, favorites, lists, game API identifiers and other metadata can be
added through separate reviewed migrations when their requirements are settled.

Enable RLS on all three tables and grant only SELECT to public application roles.
Public readers see published profiles and their ratings, plus the game catalog.
Explicitly revoke application write privileges on these tables. Administrator
migration/seed access is separate from the application's publishable key.
Index `ratings.game_id`; the composite primary key already starts with profile ID.
No public write policies, privileged RPC functions or authentication changes.

## Proposed seed scope and unresolved source conflicts

Seed the existing 32-game catalog and one fictional sample profile, Alex Vance.
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

Recommendation: use the personal profile scores for its eight displayed games,
then the tier-board scores for other games, followed by the remaining catalog
entries. Copy explicitly displayed tiers independently; leave absent tiers null
instead of computing them from scores. This policy needs user agreement.

The catalog also mistakenly extracted `2077` from Cyberpunk's title as a release
year. Search/comparison show 2020, while the profile shows 2023. Disco Elysium
also has conflicting years (2021 on the profile, 2019 on the tier board).
Recommendation: keep disputed release years null in the initial database seed
until a metadata policy is agreed. The existing visual prototype is unchanged.
Conflicting cover variants need not be replaced: retain their existing per-screen
presentation assets while using the catalog's current cover as the database value.

## Delivery and verification

After schema, seed precedence and ranking order are agreed:

1. Create migration files with the official Supabase CLI and review the SQL in Git.
2. Keep demo seed content separately identifiable from production schema changes.
3. Apply the approved migration and seed through authenticated administration.
4. Verify constraints, seeded row counts, public reads and denial of public writes.
5. Run Supabase advisors and generate matching TypeScript database types.
6. Connect screens in a separate reviewed change, preserving layout and styling.

Database-backed counts, averages and comparisons must eventually use actual
records. Existing fabricated totals (such as 384 games) must not be presented as
calculated values. Agree on those visible content changes before connecting UI.
