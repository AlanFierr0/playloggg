# Saved platform, playtime, and completion date

Status: migration applied; the user authorized production rollout from `main`.

The user approved one optional platform using the existing PC / Steam,
PlayStation 5, Xbox Series X, and Steam Deck choices. Playtime and completion
date are optional and independent of playback status.

## Behavior

Commit saves platform, finite nonnegative decimal hours, and a calendar date
alongside score, tier, status, and review. Blank means not supplied; zero hours
is a real supplied value. Selecting the current platform again clears it.
The date uses the browser's calendar input and is stored as YYYY-MM-DD without
converting time zones. Impossible dates are rejected. No automatic status/date
changes or sample play details are invented.

A successful save becomes the new Discard baseline for all saved fields.
Invalid playtime and failed requests retain the draft without changing saved
values. Reload restores these details from the selected profile's entry.
Broadcast remains temporary. Personal tags and curated lists are implemented
in the subsequent local milestone; see [tags-and-curated-lists.md](tags-and-curated-lists.md)
for their pending production rollout.

## Schema and access

Applied migration: `20260929032418_saved_play_details.sql`.
Add nullable `platform` text with a four-value check, `hours_played` double
precision with a finite/nonnegative check, and `completed_on` date limited to
four-digit calendar years 0001–9999. Decimal hours use the same numeric
representation as JavaScript. Existing records receive nulls.

Grant INSERT/UPDATE on these columns to authenticated owners under the existing
RLS policies. Public reads retain the published-profile policy; private entries
stay owner-only. No new profile/catalog access or anonymous writes are introduced.
The live schema and grants were inspected before preparing the migration.
Database types were regenerated from Supabase after applying the migration.
The migration filename matches remote history.

## Verification and rollout

TypeScript, lint, production build, fourteen input/data tests, and sample seed
reproducibility pass. A read-only query against Supabase confirmed the playtime
constraint accepts zero/decimal hours and rejects negative hours, infinities,
and NaN. The post-migration test in `supabase/tests/saved_play_details.sql`
checks owner insert/upsert, null clearing, independent dates, constraints,
sample protection, cross-owner reads/updates, and anonymous isolation with
rolled-back fixtures. It passed against the applied schema, as did the existing
owner-access and optional-score/status SQL tests. No test data was retained.

An isolated local Auth/Data API and browser verified all four platform buttons,
initial blank details, decimal/zero hours, date/status independence, saved-value
reload, invalid-playtime draft retention, failed-save recovery, Discard baselines,
and clearing all three fields to null. Existing Backlog, score statistics, tier
independence, escaped reviews, and sign-out checks pass. The 390px mobile layout
was inspected; there is no horizontal overflow or browser runtime error. These
checks did not write any real owner or sample data.

The user authorized pushing `main` for Vercel deployment. No new credentials or
Auth settings are needed. Verify a real owner save and refresh in production.

Security advisors report no database/RLS findings. The existing
[disabled leaked-password protection warning](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
remains; Auth settings were not changed.
