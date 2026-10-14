# Steam library import

## Using the importer

1. Sign in using Steam and create your Playlogg profile if needed.
2. Open **Import from Steam** from your profile tools or Profile settings.
3. In Steam privacy settings, make **Game details** public and allow playtime
   to be visible. This does not publish your Playlogg profile.
4. Your library loads automatically when you open **Import from Steam**.
   **Refresh library** reloads it or retries after an error.
   Games already logged in your profile are hidden, including manual entries,
   before filters and pagination. Newly imported games disappear from the cards.
   All games is selected by default. The complete available list appears together
   after loading; the loading indicator reports progress meanwhile.
   You can choose 25, 50, 100 or All games. **Load more**
   appends the next chosen amount and keeps existing cards and selections.
   All fetches every match in bounded requests; **Stop loading** stops after the current
   request and keeps games already loaded. Load more can resume a stopped load.
5. Sort by title, most played or least played, and optionally type minimum and
   maximum hours. Results update automatically after a 350 ms typing pause;
   no Apply button is needed. Inputs remain editable while previews load, and
   outdated requests cannot replace results for the latest filters.
   Blank limits are unrestricted; zero includes unplayed games.
   Filters and sorting apply to the whole library before batches are chosen.
   Select individual matched games, or **Select available games** among loaded cards.
6. Select **Import selected games** in the upper-right toolbar, then choose
   **Rate all games**, **Rate some games**, or **Just import**. Some games opens a
   picker over the games selected for import: filter by genre, title and minimum/
   maximum playtime, sort by title/playtime, then select individual or matching
   games. Hidden selections stay selected until cleared. No writes happen until
   you confirm an import mode or the picker.
   Games are imported in batches of up to 25, with
   a centered modal over the library showing the current title, processed/total
   count, remaining count and progress bar. It keeps focus and disables interaction
   with the page behind it while saving. Its spinner
   respects reduced-motion preferences. In Just import mode, the indicator disappears on completion
   or failure, while errors remain available for retry. Successful imports stay saved if another
   batch fails; retry keeps only failed selections. A rating write is atomic within its batch. Changing filters, sorting or
   the amount resets the loaded set and selection; loading more preserves them.
   In rating modes, chosen games are imported first and enter a one-at-a-time
   editor as each batch succeeds; the first rated game is imported separately so rating can begin promptly. Set an optional independent tier, 0–100 score
   (typed or slider), and playback status; **Save and next** persists these three
   fields, while **Skip this game** leaves them unset. Other selected games keep
   importing while you edit. Import errors and rating errors are separate; failed
   saves retain the draft for retry. Existing/concurrently logged entries are not
   added to the rating queue. **Done** closes the session after the import ends.
   Keep the page open until import finishes: this is an in-page workflow, not a
   durable job that survives closing the tab. Import/rating skips leave the game
   logged and editable later from the profile.
7. **Sync Steam playtime** updates hours for existing PC / Steam entries, including
   manual PC entries with an exact Steam match. It works independently of the
   current filters or loaded amount, in requests of at most 25 games. The server
   rechecks ownership, platform and fresh Steam playtime for every request.
   Scores, tiers, status, platform, reviews, tags and completion dates stay intact.
   Unchanged hours do not update timestamps; concurrent editor saves are skipped
   and reported for retry. Partial successes remain saved if another update fails.

Each new entry saves PC / Steam and playtime, rounded from minutes to two decimal
hours. Zero hours remain zero. Score, tier, status, review and completion date
stay unset until explicitly supplied in the optional rating session; no favorites are created. Existing entries are skipped, including
concurrent edits. Steam ownership is not treated as proof of completion.

Only Steam sign-in accounts can use the first version. Connecting Steam to an
email account or merging accounts is not included. This is a manual import,
not a scheduled synchronization; importing preserves existing entries. Updating
their hours requires the separate sync button.

## Production configuration

1. Open [Steam Web API key registration](https://steamcommunity.com/dev/apikey)
   while signed in to Steam.
2. Register the domain `playloggg.vercel.app`.
3. Store the key in Vercel Production as **STEAM_WEB_API_KEY**, with no public
   prefix. Never paste it in chat, documentation, committed files or browser code.
4. Deploy after adding the variable. Existing server-only catalog credentials
   (`IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`, `SUPABASE_SECRET_KEY`) are also required
   to match games and add missing metadata to the shared catalog.
5. Verify preview with a real Steam account before performing a chosen import.

Without the Steam key, the importer displays a configuration message and makes
no library requests. Private/inaccessible game details produce a privacy message.
Steam failures and provider failures allow retries without exposing credentials.

## Access and matching

Every server action verifies Supabase Auth and database profile ownership. The
Steam ID comes only from trusted `app_metadata.playlogg_steam_id` written by the
existing verified OpenID bridge. The browser supplies bounded app ID batches only; the server
reads the owner-bound library to validate ownership and obtain trusted playtime.

Game matches use Steam app IDs from the provider's external-game records,
restricted to the Steam source. Ambiguous/missing matches are not selectable.
Titles are never used for automatic matching. Missing shared metadata is normalized from verified provider matches and inserted
by the same server-only catalog admin used for individual catalog imports. Personal entry insertion uses the
authenticated client and existing RLS, with ON CONFLICT DO NOTHING on
`profile_id,game_id`; the admin client never writes personal entries.
The import returns the saved entry slug and update timestamp only for a newly
created log. Rating saves re-verify Steam/Auth ownership and validate all inputs,
then update score/tier/status on that existing PC entry with a timestamp check.
No upsert, playtime/platform/review/tag/date overwrite, schema change or new grant
is needed. A concurrent manual edit takes precedence and the rating screen tells
the user to skip and edit the latest version from their profile.

Preview covers use existing catalog artwork or the exactly matched provider
cover. If unavailable or broken, try Steam's library capsule and then its header.
If neither image exists, use a game icon in a consistently sized thumbnail.
No generated artwork is used, and preview does not import catalog metadata.
Preview matching stays in server requests of at most 25 games, including All.
Stored entries are read with pagination and their provider IDs are resolved in
batches of 100 before calculating the remaining library count. Earlier imports
did not record provenance, so hiding applies to all logged exact matches and
syncing applies to all logged PC / Steam exact matches, as agreed with the user.

No new tables, database grants or migrations are needed. Steam IDs, library
responses and the API key are not put in public URLs or public profile metadata.
Only explicitly selected imported entries become visible if the profile is public.

## Verification

- `scripts/test-steam-library.mjs`: strict library parsing, zero playtime,
  minutes-to-hours conversion, bad IDs, ambiguous and cross-store matches.
- `e2e/steam-library.spec.ts`: preview before writes, load-more preservation,
  25/50/100/All amounts, global playtime sorting/ranges, cover failure fallbacks, selected imports,
  missing metadata, zero-hour entries, unchanged existing entries, guest/email
  exclusion, inaccessible libraries, failed-save retry, accessibility and mobile.
  Also verifies imported games stay hidden after reopening, sync retry, unchanged
  non-playtime fields and other profiles, and idempotent sync without date changes.
  Rating-flow checks cover all/some/no ratings, live editing during imports, genre/
  title/playtime selection, independent tier/status, score zero, retry without lost
  drafts, skips and concurrent manual edit protection.
- The fixture provider intercepts only the isolated test process. It does not
  replace Steam authentication or production RLS verification.

API references: [Steam GetOwnedGames](https://partner.steamgames.com/doc/webapi/IPlayerService#GetOwnedGames)
and [external-game matching](https://api-docs.igdb.com/#external-game).

The review implementation reuses an owner-bound server library for at most 30 seconds between filters/pages/imports. Opening the page and Refresh force a fresh read; sync also re-fetches. Authorization remains fresh for every action. The cache is bounded to 50 warm-instance entries and does not guarantee cross-instance deduplication. See [the execution plan](review-execution-plan.md) for quotas, final import counts, retries and manual search behavior.


The rating screen focuses on one game. Import progress and reviewed counts are
automatically shown as a compact bottom-right toast when rating imports starts or resumes while importing. There is no Import details button. The native manual
popover stays above the rating modal without a second backdrop or focus trap;
users can continue scoring or dismiss it. The toast closes automatically when importing finishes; resuming a completed import does not reopen it. Close rating session hides the editor
without stopping imports; Resume rating games reopens it. The queue, position and
current score/tier/status draft are kept in localStorage scoped to the verified
profile ID. Refreshing or leaving the page restores a closed session in the same
browser. Completed sessions are removed when Done is clicked. Storage errors
are reported, and invalid cached sessions are ignored. No credentials are stored.
Server ownership and timestamp checks still run on every save.

Imports only continue while the page is open. If a page is left mid-import,
acknowledged successful imports remain available for rating; refresh the library
to import remaining games. Pending requests are not a durable background job.

Rating queues start with the most-played selected games (Steam hours descending),
for both all-games and filtered some-games sessions, regardless of selection order.

The rating popup places Game info to the right of the game name, opening the stored catalog game in a new
tab so the current draft and running import stay on the original page. It loads
Steam overall review summaries only for the displayed game. A verified Steam
account and the existing operation limit are required. Fixed Steam URLs use a
validated app ID, an eight-second timeout and a one-hour public fetch cache.
Show Valve's description, positive percentage, review count and all-language
scope for Steam purchases, using the default off-topic filtering. Review labels
link to the Steam store reviews. Missing/failed reviews do not block ratings.
No user score is inferred and no review text or reviewer identities are returned.
Provider reference: https://partner.steamgames.com/doc/store/getreviews


Import speed optimization (2026-10-06): the browser sends at most 25 Steam app
IDs per server action. Each action validates the batch, verifies the current
account and trusted Steam identity, checks the Steam request quota, and reads
owner-bound Steam playtime. Browser metadata and hours are never accepted.
The preview's exact, unambiguous provider matches and normalized public metadata
are reused in a five-minute, 1,000-entry warm-instance cache. Provider failures
are not cached; cold/expired/evicted matches are resolved in one bounded IGDB
query, with the existing HTTP throttle intact. This cache contains no ownership
or playtime data and cannot authorize an import.

Catalog IDs/slugs are read together. Missing metadata is inserted together under
the existing per-new-game import quota, with DO NOTHING and a read fallback for
concurrent catalog imports. Ratings are inserted in one atomic batch under the
owner's RLS, also with DO NOTHING. Existing entries retain every field and their
timestamps. Results preserve request order and identify individual unmatched,
unowned, skipped and imported entries. Successful earlier batches survive a
later failure; failed rating batches can be retried safely. Catalog invalidation
and page refresh happen once per batch, with no global catalog refresh for batches
that only reuse stored games. Rating queues retain descending playtime order.

The isolated two-game check originally made three extra IGDB requests, five
catalog reads and two rating writes after preview. It now requires zero extra
IGDB requests on a warm cache, one catalog read and one rating write. These are
request-count measurements, not a production wall-clock speed guarantee.


Further speed optimization (2026-10-06): logged-game resolution uses a 30-second,
50-entry preview snapshot keyed by verified Auth ID, profile ID and Steam identity.
Only app IDs and PC sync IDs are cached. Every preview still re-verifies ownership;
the first page of each load/filter refresh resolves a fresh snapshot, and imports
invalidate it. Subsequent pages reuse it while warm. Sync always reads fresh entry
data. A cold/expired snapshot resolves normally; no browser snapshot is trusted.
The 127-game fixture now reads logged ratings once across six pages, instead of six
times. Logged-game matching also uses maps instead of repeated linear searches.

New-game import quotas use consume_operation_limit_batch, restricted to service_role,
with SECURITY INVOKER and an empty search_path. The additive migration is
supabase/migrations/20261007001817_steam_import_batch_quota.sql. It reuses the existing
atomic minute/day counters once for each admitted game, returning the allowed
prefix and retry delay without increasing either limit. Up to 25 new games now
require one quota RPC rather than 50. Existing catalog entries can still import
when the new-game quota is exhausted; only the remainder is kept for retry.
No profile/catalog write grants or Auth/RLS policies change.

Supabase boundary checks are runnable via supabase/verify_steam_import_batch_quota.sql.
They cover both windows, shared counters with individual imports, 25-game charging,
invalid batches and server-only privileges; synthetic counters roll back. Security
advisors reported the existing intentional no-policy private counter table and
existing [disabled leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), with no new function/grant finding.

## Achievement completion-date suggestions

**Find completion dates**, beside playtime sync, checks existing PC / Steam logs
with missing dates. The scan processes five games per batch and at most two
Steam reads simultaneously; Stop scan pauses after the current reads. Retry
unfinished games preserves earlier results. Ongoing/live-service games and
active, paused or stopped entries are excluded.

The Campaign import editor also checks the current game's achievements without
blocking rating. Suggestions display the original English achievement name,
description and UTC date in chronological order. **Use this date** chooses one
candidate and marks the draft Completed; the existing calendar allows correction.
Only **Save and next** persists the import draft. For existing logs,
**Confirm completion** immediately saves that chosen date and Completed status.

Detection uses conservative English text rules for story/campaign/game completion,
endings and final bosses. It excludes chapter/level/tutorial/match/round and DLC
completion. These are suggestions, not proof of finishing the game. Unsupported,
private or unavailable achievements leave manual completion-date entry available.
Zero, future and pre-release achievement timestamps are ignored. Multiple endings
are never selected automatically. No dates are inferred from last played or hours.

Server actions resolve the linked Steam ID from verified Auth metadata, validate
ownership and the exact provider mapping, and use STEAM_WEB_API_KEY server-side.
Achievement reads use a bounded, owner-and-app-keyed 15-minute warm-instance cache;
rejected reads are not cached. No extra provider, key or database migration is needed.
Confirmed dates use the existing guarded rating save with timestamp checks: existing
dates and unrelated entry fields are preserved, concurrent edits require reloading.
Confirmed Completed entries appear in the profile timeline. Older saved import drafts
resume with a blank completion date. Scans stop when leaving the page and do not
run as background jobs.
