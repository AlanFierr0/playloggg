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
   Games are imported sequentially, with
   a centered modal over the library showing the current title, processed/total
   count, remaining count and progress bar. It keeps focus and disables interaction
   with the page behind it while saving. Its spinner
   respects reduced-motion preferences. In Just import mode, the indicator disappears on completion
   or failure, while errors remain available for retry. Successful imports stay saved if another
   game fails; retry keeps only failed selections. Changing filters, sorting or
   the amount resets the loaded set and selection; loading more preserves them.
   In rating modes, chosen games are imported first and enter a one-at-a-time
   editor as each import succeeds. Set an optional independent tier, 0–100 score
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
existing verified OpenID bridge. The browser supplies an app ID only; the server
fetches the owned library again to validate ownership and obtain trusted playtime.

Game matches use Steam app IDs from the provider's external-game records,
restricted to the Steam source. Ambiguous/missing matches are not selectable.
Titles are never used for automatic matching. Missing shared metadata uses the
existing trusted catalog import action. Personal entry insertion uses the
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
opened separately through Import details. Close rating session hides the editor
without stopping imports; Resume rating games reopens it. The queue, position and
current score/tier/status draft are kept in localStorage scoped to the verified
profile ID. Refreshing or leaving the page restores a closed session in the same
browser. Completed sessions are removed when Done is clicked. Storage errors
are reported, and invalid cached sessions are ignored. No credentials are stored.
Server ownership and timestamp checks still run on every save.

Imports only continue while the page is open. If a page is left mid-import,
acknowledged successful imports remain available for rating; refresh the library
to import remaining games. Pending requests are not a durable background job.
