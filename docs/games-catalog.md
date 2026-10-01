# Games catalog

The Games tab at `/games` browses all stored Supabase catalog games, including
titles the selected profile has not logged. It reuses the selected profile,
existing permissions, reviewed covers and responsive site container. No schema,
credentials or new dependencies are required for browsing. Production rollout
from `main` is complete; Vercel deployed commit `36e9226` successfully.

Catalog filters include word search across titles, keywords and genres; exact
genre, available platform and release year; and alphabetical, release date or
profile score sorting. Unknown dates and scores sort last in either direction.
Platform options come from catalog metadata, not the platform someone played on.

The expandable profile filters include logged/unlogged games, playback status,
independent tier, rated/unrated entries and inclusive integer score bounds from
0 to 100. Blank bounds are unrestricted; zero remains a real score. A reversed
or invalid range shows an explanation. Unlogged games never acquire fabricated
status or scores. A logged entry with no status remains distinct from an unlogged
game. Guest catalog browsing does not invent personal entries.

All filters combine. The Games to show selector offers 25 (default), 50, 100 and
All. Load more adds another selected-size batch while retaining every previously
shown card. The button disappears once all matching games are shown; All displays
the complete filtered result immediately. Covers stay lazy-loaded.

Changing filters, sort or amount resets the loaded batches to one. Clearing
filters preserves the selected amount. Filters, amount (`size`) and loaded batches
(`page`, retained for existing shared links) live in the URL and survive reload
and Back/Forward. Loading more preserves the scroll position. Filtering runs on
the server and only compact visible-card data and facets reach the screen. No
browse operation writes to the database. See [growth and limits](catalog-growth.md).

Cards open game details. Authenticated owners additionally get log/edit links
and a link to search IGDB for new games. IGDB search/import remains a separate
verified profile-owner operation requiring the credentials documented in
[IGDB catalog import](igdb-catalog-import.md). Closing search returns to Games.
The Discover page's Explore All Games link also opens the catalog.

## Original verification (before Load more)

- `node --experimental-strip-types --test scripts/test-games-view.mjs` covers
  catalog/profile filter combinations, unlogged entries, independent tiers,
  nullable/zero scores, invalid ranges, sorting and non-mutating input behavior.
- Browser checks against the actual read-only catalog cover 24/8-card pagination,
  title search, empty status results, clearing filters, detail navigation, Discover
  navigation and search returning to Games.
- The open profile filter section and all five navigation tabs fit at 320, 390,
  640, 768, 1024, 1440, 1920 and 2560 pixels without horizontal page overflow.
  Mobile and desktop screenshots were visually inspected.

Production checks passed catalog pagination, combined title/year and tier/score
filters, invalid score ranges, clearing filters, saved catalog search and return
navigation. All five tabs fit at 320, 390, 768, 1024 and 1920 pixels without page
overflow. Anonymous log saving remains disabled. Vercel reported no recent
runtime errors after rollout, and all 28 current automated tests pass.

## Load-more verification — 2026-10-01

Unit checks cover all four amounts, retained prefixes without duplicate cards,
end-of-results clamping, empty filters, shared amount/loaded-batch URLs and
rejection of unsupported sizes. Existing card payload checks still exclude review
text, full descriptions and screenshots. Browser checks cover load more, all
amounts, filter resets, reload, history and search return on desktop and mobile.
