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
