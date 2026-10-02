# Steam library import

## Using the importer

1. Sign in using Steam and create your Playlogg profile if needed.
2. Open **Import from Steam** from your profile tools or Profile settings.
3. In Steam privacy settings, make **Game details** public and allow playtime
   to be visible. This does not publish your Playlogg profile.
4. Select **Preview Steam library**. Choose 25, 50, 100 or All games. **Load more**
   appends the next chosen amount and keeps existing cards and selections.
   All loads every match progressively; **Stop loading** stops after the current
   request and keeps games already loaded. Load more can resume a stopped load.
5. Sort by title, most played or least played, and optionally apply minimum and
   maximum hours. Blank limits are unrestricted; zero includes unplayed games.
   Filters and sorting apply to the whole library before batches are chosen.
   Select individual matched games, or **Select available games** among loaded cards.
6. Select **Import selected games**. Games are imported sequentially, with
   progress and individual errors. Successful imports stay saved if another
   game fails; retry keeps only failed selections. Changing filters, sorting or
   the amount resets the loaded set and selection; loading more preserves them.

Each new entry saves PC / Steam and playtime, rounded from minutes to two decimal
hours. Zero hours remain zero. Score, tier, status, review and completion date
stay unset; no favorites are created. Existing entries are skipped, including
concurrent edits. Steam ownership is not treated as proof of completion.

Only Steam sign-in accounts can use the first version. Connecting Steam to an
email account or merging accounts is not included. This is a manual import,
not a scheduled synchronization; existing entries' hours are not overwritten.

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

Preview covers use existing catalog artwork or the exactly matched provider
cover. If unavailable or broken, try Steam's library capsule and then its header.
If neither image exists, use a game icon in a consistently sized thumbnail.
No generated artwork is used, and preview does not import catalog metadata.
Matching stays in server requests of at most 25 games, including All, to bound
provider requests and let partial loads/retries retain their progress.

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
- The fixture provider intercepts only the isolated test process. It does not
  replace Steam authentication or production RLS verification.

API references: [Steam GetOwnedGames](https://partner.steamgames.com/doc/webapi/IPlayerService#GetOwnedGames)
and [external-game matching](https://api-docs.igdb.com/#external-game).
