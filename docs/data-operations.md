# Data export, deletion and backup operations plan

This is a concrete operator runbook for the current application, not a promise of
self-service UI, an approved retention policy or a claim that scheduled backups
and disaster recovery have been configured. Do not add export/delete buttons
until their ownership checks and operations have been implemented and verified.

## Identity and scope

1. Verify the requester through the existing signed-in Auth account. Derive the
   Auth user ID on the server, then resolve `profiles.owner_user_id` to its one
   non-sample profile. Never accept a browser-supplied profile ID as proof.
2. Confirm whether the request concerns a portfolio export, portfolio deletion
   or complete Auth-account deletion. Complete deletion is irreversible and
   needs explicit confirmation identifying the exact account and profile.
3. Keep request records minimal. Never collect passwords, email sign-in links,
   Steam assertions, session tokens or provider/admin secrets in a ticket.

## Personal export

1. Use the verified profile ID to read its profile fields, ratings, curated lists
   and ordered list items. Use a read-only consistent database snapshot for an
   operator export, or document the limitation of paginated API reads during
   concurrent edits. Never export all profiles and filter the result afterward.
2. Include handle, display name, visibility; entry score, independent tier,
   status, platform, hours, completion date, review and tags; list names, revision
   and ordered game slugs. Include stable game IDs/IGDB IDs, titles and relevant
   public catalog references so entries can be understood outside Playlogg.
3. Package a versioned JSON manifest with UTC export time and per-table row
   counts; verify counts and preserve null scores/tiers, zero values and list
   ordering. Do not include another person's data, Auth tokens or secret keys.
   Account email/Steam identity, if separately requested, must be handled through
   a verified private account-data process rather than public portfolio queries.
4. Deliver only to the verified requester through an access-controlled channel.
   Keep the file outside Git, public storage, build artifacts and CI logs. Decide
   export-link expiry and temporary-file retention before automating delivery.

## Deletion (execute only after explicit approval)

1. Offer the export first. Confirm the target Auth user and linked profile, and
   check the current foreign keys/cascades rather than assuming their behavior.
2. Unpublish the target profile, verify anonymous profile/list/entry reads return
   404, and record only an operation identifier and row counts needed for audit.
3. Delete only the verified profile's list items, lists and ratings, then its
   profile in a controlled transaction in the order required by the current
   constraints (or verified cascades). Shared games remain for other users.
   Never delete a catalog game to remove one person's entry.
4. For complete account deletion, revoke sessions and follow the current
   Supabase Auth admin deletion procedure. Check existing tokens/session behavior
   and Steam-account mappings before claiming access has ended. Deleting the
   original email owner also requires an agreed catalog-administration handoff.
5. Verify counts, ownership, anonymous 404s and that another account's entries,
   lists and catalog still work. Invalidate application paths/catalog tags only
   where appropriate. Keep personal data out of operation logs.
6. Document that old shared screenshots/search caches and protected backup copies
   cannot be recalled automatically. Backup expiry and any lawful retention must
   be agreed as policy before promising a deletion deadline; do not silently
   restore a deleted account during recovery.

## Backups and recovery

1. Inspect the actual Supabase project plan, backup availability and last
   successful backup in the dashboard. Paid-plan facilities and free-plan manual
   exports differ; do not assume the current project has PITR or daily backups.
   Supabase recommends regular off-site logical exports for free projects. See
   [database backups](https://supabase.com/docs/guides/platform/backups).
2. Before schema maintenance or destructive operations, obtain an encrypted
   backup in a separately controlled location, verify its timestamp/checksum and
   record the database version. For logical dumps, discover the installed CLI
   version and `supabase db dump --help` first; follow the current official
   [backup/restore guide](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).
   Keep connection strings and dump files outside this repository and CI artifacts.
3. Include schema, necessary data and roles/settings according to the selected
   backup method. Supabase Storage file bodies require separate coverage when
   used; database backups alone must not be described as file backups. Current
   catalog artwork is externally hosted on IGDB, so backups retain references
   but do not guarantee the external files' continued availability.
4. Keep migrations/code in Git and environment secrets in the approved secret
   store. Decide schedule, encrypted destination, retention and recovery time/data
   loss targets with the owner before enabling a recurring job or spending money.
   Alert on backup failure, rather than treating a scheduled job as proof.
5. Test restoration into an isolated approved target, never over production as a
   test. Disable external integrations there, verify row counts, ownership/RLS,
   private/public behavior, zero/null fields and list ordering, then record the
   result. A production restore/reset/deletion requires explicit approval.
6. Before reopening a restored app, reconcile approved deletions/unpublishing
   after the backup and verify Auth/provider/site configuration. A dump existing
   is not proof that recovery works; the isolated restore exercise is a separate
   operation still to be configured and performed.
