# Saved platform, playtime, and completion date

Status: implemented locally on `main`; migration and production deployment pending approval.

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
Tags, shelves, and broadcast remain temporary or unavailable.

## Schema and access

Prepared migration: `20260929024822_saved_play_details.sql`.
Add nullable `platform` text with a four-value check, `hours_played` double
precision with a finite/nonnegative check, and `completed_on` date limited to
four-digit calendar years 0001–9999. Decimal hours use the same numeric
representation as JavaScript. Existing records receive nulls.

Grant INSERT/UPDATE on these columns to authenticated owners under the existing
RLS policies. Public reads retain the published-profile policy; private entries
stay owner-only. No new profile/catalog access or anonymous writes are introduced.
The live schema and grants were inspected before preparing the migration.
Local database types include the prepared columns; regenerate from Supabase
and align the migration filename with remote history after applying it.

## Verification and rollout

TypeScript, lint, production build, fourteen input/data tests, and sample seed
reproducibility pass. A read-only query against Supabase confirmed the playtime
constraint accepts zero/decimal hours and rejects negative hours, infinities,
and NaN. The post-migration test in `supabase/tests/saved_play_details.sql`
checks owner insert/upsert, null clearing, independent dates, constraints,
sample protection, cross-owner reads/updates, and anonymous isolation with
rolled-back fixtures. It has not yet run against the new schema.

An isolated local Auth/Data API and browser verified all four platform buttons,
initial blank details, decimal/zero hours, date/status independence, saved-value
reload, invalid-playtime draft retention, failed-save recovery, Discard baselines,
and clearing all three fields to null. Existing Backlog, score statistics, tier
independence, escaped reviews, and sign-out checks pass. The 390px mobile layout
was inspected; there is no horizontal overflow or browser runtime error. These
checks did not write any real owner or sample data.

Before production rollout: apply the migration, regenerate types, run the new
SQL test plus existing owner-access/status tests, and check advisors. Then push
`main` for Vercel deployment. No new credentials or Auth settings are needed.
Verify a real owner save and refresh in production.
