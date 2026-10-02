# Backlog and saved playback status

Status: migration applied; production rollout from `main` authorized.
The user approved adding backlog and playing games without rating them.

## Behavior

- Continue using one current profile/game entry in `ratings`. Its score is now
  optional: null is unrated; zero remains a real 0–100 score. Scores and tiers
  stay independent. Reviews do not require a score.
- Save optional status: `completed`, `playing`, `backlog`, or `shelved`.
  Null means not supplied. Do not guess statuses for the existing sample data.
- The log starts an unrated game without a score or status. Add/Remove score
  and Clear status controls make the distinction explicit. Discard closes the
  editor and returns to Profile without saving; the last saved score, tier,
  status and review remain unchanged. Failed saves preserve the draft.
- Rankings, threshold filters, rating counts and averages use scored games only.
  The Backlog tab uses saved `backlog` entries, including unrated games. An
  unrated backlog card has no numeric rank or fake star rating. Ordering remains
  score descending with unrated entries last, then game slug for ties.
- Tier groups include logged games even without a score, respecting their
  independent tier. Unassigned includes logged entries without a tier, excluding
  unlogged catalog games. Empty averages stay unavailable, not zero.
- Game detail displays saved playback status. Platform, hours, and completion date are covered by the applied
  [saved play details](saved-play-details.md) migration. Tags and curated lists
  are implemented in the [pending next milestone](tags-and-curated-lists.md).
  Broadcast remains temporary.

## Schema and access

Applied migration: `20260929024025_optional_scores_and_playback_status.sql`.
Drop score NOT NULL, retain its range constraint, add nullable checked `status`,
and grant authenticated INSERT/UPDATE for that column. Existing owner-only RLS
and all other grant restrictions remain. No anonymous writes, profile claiming,
catalog writes, or rating deletion are added. Existing records retain scores
and receive null status. Database types were regenerated
from Supabase after applying it; the filename matches remote migration history.

## Verification and rollout

TypeScript, lint, build, eleven data/input tests, and seed reproducibility pass.
The prepared migration was tested in a rolled-back transaction against the
actual project: null-score backlog/playing insertion and upsert, zero-score
transition, score/status clearing, constraints, and private-entry isolation pass.
The complete owner-access test also passes with this migration in a rolled-back
transaction. No test rows or schema changes were kept.

An isolated local Auth/Data API verified unrated Backlog saves and reload,
Backlog-to-playing transitions, a real zero score in counts/averages, independent
tiers surviving score/status clearing, failed-save draft retention, discard to
saved values, escaped review rendering and sign-out. The 390px mobile layout
has no horizontal overflow; browser runtime checks report no errors.

After applying the migration, both
`supabase/tests/optional_scores_and_playback_status.sql` and
`supabase/tests/owner_rating_access.sql` passed against the deployed schema.
Their test fixtures were rolled back. The user authorized pushing `main` to
deploy the application. No additional Auth settings or environment variables
are required. A real owner save and reload still needs production verification.

The security advisor reported no database/RLS findings. It did report disabled
[leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
in Auth. This rollout did not change Auth settings.
