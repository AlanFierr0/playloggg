# Data export and recovery

Owners can download JSON or CSV from Settings. The response is authenticated, private and never cached. It includes original reviews, scores including zero, nullable playtime/dates, tags, automatic/manual tiers, score ranges, personal ranking anchors and independent favorites. JSON schemaVersion is 1. Ranking positions/anchors in both formats are zero-based. CSV contains profile, range, log, favorite and ranking records; quoted text is protected against spreadsheet formulas. JSON preserves text exactly and is the preferred portable copy. Account credentials, email, Steam IDs and avatar bytes are excluded. There is no self-service import yet.

## Production state checked October 13, 2026

The authenticated Supabase backup-list command reported zero available backups, PITR disabled and WAL-G backup support enabled. This is not proof of a usable production restore point. Production off-site scheduling is not configured by this change. No paid backup add-on or production restore was enabled.

Database backups do not include picture bytes, only Storage metadata. See [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups). Keep database dumps, private picture copies and runtime configuration in separate private off-site storage. Do not put real user backups in this public repository or public CI artifacts.

## Rehearsal in Application checks

The database job starts fresh local Supabase, applies every migration and verifies owned writes, visibility and guards. `scripts/verify-recovery.mjs` then seeds unmistakable dummy data and uploads a real WebP to local private Storage. It downloads a file copy, dumps the local database with pg_dump, restores it into a new isolated database and verifies Auth identity, zero/null-safe log data, favorites, ranking anchors, custom ranges, picture metadata and RLS. It removes only the dummy local object, uploads the saved bytes and checks SHA-256 equality. Its CI/local-host guards prevent use against production. It never downloads production user records. The CI database job fails if any rehearsal check fails.

## Actual incident procedure

1. Stop writes and preserve the affected state before considering a restore. Record the target restore time and user impact. Obtain explicit owner approval before a production restore; it causes downtime and replaces newer data.
2. Select a verified provider restore point, or recover a private logical database backup following [Supabase’s supported restore procedure](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore). Restore into an isolated project first. Do not experiment on production.
3. Restore picture bytes separately to the private `profile-pictures` bucket with the exact bucket/object paths captured in the database. Check file checksums, privacy, owner access and the app’s avatar endpoint.
4. Restore project configuration from private credential storage. A database dump is not a substitute for Auth/provider credentials, signing secrets, Vercel environment variables or migration history.
5. Run the ownership/visibility regression and browser account/read/write checks against the isolated restored project, including private profile denial, zero ratings, favorites, tiers, rankings, review votes and pictures. Only promote after approval. Keep the pre-restore state privately until the incident is resolved.

The automated rehearsal verifies the local restore mechanics. A real production restore point and complete provider cutover have not been exercised; that requires a verified private backup and an isolated recovery destination.
