# Profile sample marker removal

The user requested removal of `public.profiles.is_sample` after demo data cleanup.
Both existing profiles are real, owned accounts. Ownership continues to come from
verified Auth and `owner_user_id`; publication continues to use `is_public`.

## Rollout

1. Deploy reads, account creation, profile/avatar edits, login and comparison
   queries without the obsolete column. Keep Auth ID and profile ID constraints.
2. Apply `20261001185254_remove_profile_sample_flag.sql`: remove the obsolete
   predicate from 17 inspected policies and two SECURITY INVOKER RPCs, drop the
   demo-only constraint and column, and verify hashes of every retained record.
   No CASCADE, privilege grants or personal-data deletions are used.
3. Regenerate Supabase types and run rollback-only owner ratings, lists, favorites
   and private picture policy checks, plus production smoke checks.

The empty seed and retired cleanup script cannot recreate demo data or classify
real profiles as demos. Original schema migrations stay unchanged as history.

## Production verification — 2026-10-01

Migration applied after compatible commit `e72c8b2` reached Vercel READY.
The column is absent, with zero remaining policy/RPC references. Both existing
profiles, their saved entry and the entire 1,000-game catalog have identical
retained-record hashes before/after removal. Neither RPC became SECURITY DEFINER.
Regenerated live database types match the committed types.

Validation passed: 68 unit tests, TypeScript, lint, production build, 12 targeted
desktop/mobile browser tests, all four rollback-only database checks (owner rating
access, curated lists, independent favorites, private picture storage) before and
after migration, and all 18 production smoke checks. No test rows/files remain.
The security advisor reported no new issues; the previously documented disabled
leaked-password check is unchanged. Its existing remediation is documented in
[Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
