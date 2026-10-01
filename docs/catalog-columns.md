# Catalog column cleanup

The user requested removal of `public.games.is_sample`, `created_at`, and
`updated_at`. Only those three game columns are removed. Profile/entry timestamps
and profile sample guards remain; `games.igdb_synced_at` still records provider sync.

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
