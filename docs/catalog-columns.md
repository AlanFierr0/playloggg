# Catalog column cleanup

The user requested removal of `public.games.is_sample`, `created_at`, and
`updated_at`. Only those three game columns are removed. Profile/entry timestamps remain; the profile sample marker was subsequently
removed in [a separate migration](profile-sample-column.md); `games.igdb_synced_at` still records provider sync.

## Rollout

1. Update catalog/detail reads, IGDB insert payloads, generated database types,
   reviewed administrative import SQL and isolated test fixtures.
2. Run unit tests, TypeScript, lint, production build and catalog smoke checks.
3. Push to `main` and wait for the compatible Vercel production deployment.
4. Apply `20261001184236_remove_game_sample_and_timestamps.sql` to Supabase.
   The migration takes a short catalog lock and checks row count and a hash of
   every retained column before/after removal. It uses no CASCADE.
5. Regenerate Supabase types, verify all 1,000 games and existing personal records,
   run the rollback-only catalog import/access SQL test and production smoke checks.

Previous migrations remain unchanged as schema history. Automatic demo seeding
stays disabled; the seed is only for isolated test databases and rejects any
existing catalog overlap. No sample players or ratings are restored.

## Verification — 2026-10-01

Applied to the production Supabase project after compatible commit `e09337e`
reached Vercel READY. All three requested columns are absent. The 1,000 catalog
rows and every retained game field have the same before/after hash. Both real
profiles and the saved rating also have unchanged counts and hashes.

Regenerated live Supabase types match the committed types. Catalog RLS stays
on, anonymous/authenticated direct inserts stay denied, and the rollback-only
server import/duplicate-reuse test passed with no retained test rows.

Validation: 68 unit tests, TypeScript, lint, production build, eight targeted
desktop/mobile browser tests, all 18 production smoke checks, and live filtered
Games/game-detail requests passed after migration.
