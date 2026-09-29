# Personal tags and curated lists

Status: migration applied; the user authorized production rollout from `main`.

The user approved both features, lists following profile visibility, and the
existing navigation with a Curated lists link on the tier board. Tags reuse the
editor's badge controls. No new credentials or Auth configuration are needed.

## Behavior

Tags save with a game's entry through Commit to Log. Each entry allows up to
20 labels of 1–48 characters; labels are trimmed and duplicates are folded
case-insensitively. Remove a tag with its badge; Discard restores the last save.
The profile tag filter includes logged unscored entries, combines with existing
score/playback filters, and resets pagination. Catalog search also matches tags.

Curated lists live at `/lists` and `/lists/[id]`. Each profile can create named
lists, add catalog games, move games up/down, remove games, rename, save or
discard, and confirm deletion. Names are 1–80 characters and unique within a
profile without regard to case. A list contains up to 500 different games.
Membership does not create a rating or change score, tier, or playback status.
Search links to matching lists. Existing navigation stays intact.

Lists follow the owning profile's visibility; the owner's current private
profile keeps its lists private. Only the authenticated owner can edit.
Anonymous visitors see the selected published sample profile. Public-profile
lists are readable under RLS, including by other authenticated users.

## Schema and rollout

Applied migration: `20260929042427_tags_and_curated_lists.sql`.
It adds validated `ratings.tags`, `curated_lists`, `curated_list_items`, and
`save_curated_list`. RLS uses the administratively assigned profile owner and
blocks sample and cross-owner writes. Anonymous roles have reads only.

The save RPC uses SECURITY INVOKER, a locked list row, and a revision check.
It saves the name and replaces the entire membership/order in one transaction.
Invalid games or stale revisions leave the saved list untouched. Failed
requests preserve the browser draft. Deleting a list requires its saved
revision and cascades only its membership; catalog games and ratings remain.

The versioned migration is applied, the filename matches remote history, and
`src/types/database.ts` was regenerated from Supabase. All four current SQL
verification suites passed against the live schema with rolled-back fixtures.
The user authorized pushing the completed `main` commits for production rollout.

## Verification

Local Postgres (PGlite, installed outside the application) applied all versioned
migrations and the separate demo seed. The owner-access, optional-score/status,
play-details, and tags/lists SQL suites pass with rolled-back fixtures.
`supabase/tests/tags_and_curated_lists.sql` checks validation, clearing tags,
custom order, unlogged-game membership, rename/removal, stale draft rejection,
transaction rollback, profile visibility, sample protection, cross-owner
isolation, anonymous restrictions, and deletion preserving ratings.

The original `read_only_portfolio.sql` verifies the historical read-only schema;
its no-write/table-wide-read assumptions predate owner persistence. Use the
current owner-access suites against the complete migration history.

Input and portfolio tests cover tag normalization, invalid list drafts, ordered
membership, forged identity rejection, tag filters, and matching list search.
Production data and real owner entries have not been modified for these checks.

Typecheck, lint, 17 input/data tests, and demo-seed reproducibility pass. The
production build passes against the live Supabase schema. Generated types stay
untouched; `src/types/supabase.ts` corrects nullable create-list RPC arguments
that the generator represents as non-nullable.
An automated browser checked anonymous read-only controls, tag save/reload and
Discard, unscored tag filtering, ordered-list create/reload, rename/removal,
stale-save draft retention, search links, and confirmed deletion preserving
ratings. The 390px mobile screen was inspected and has no horizontal overflow.
No browser runtime errors were reported.

The live Supabase security advisor reports no database/RLS findings. Its existing
Auth warning is disabled [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection);
Auth configuration was not changed during this rollout.
