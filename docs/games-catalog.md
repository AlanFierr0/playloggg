# Games catalog

The Games tab at `/games` browses all stored Supabase catalog games, including
titles the selected profile has not logged. It reuses the portfolio provider,
existing permissions, reviewed covers and responsive site container. No schema,
credentials or new dependencies are required for browsing. Implementation is
local pending production rollout.

Catalog filters include word search across titles, keywords and genres; exact
genre, available platform and release year; and alphabetical, release date or
profile score sorting. Unknown dates and scores sort last in either direction.
Platform options come from catalog metadata, not the platform someone played on.

The expandable profile filters include logged/unlogged games, playback status,
independent tier, rated/unrated entries and inclusive integer score bounds from
0 to 100. Blank bounds are unrestricted; zero remains a real score. A reversed
or invalid range shows an explanation. Unlogged games never acquire fabricated
status or scores. A logged entry with no status remains distinct from an unlogged
game. Sample profile data is labeled in the profile filter summary.

All filters combine. Changing a filter resets pagination to the first page;
clearing restores the complete alphabetically sorted catalog. Each page displays
up to 24 cards. Filters and pagination live in component state and reset when
the page remounts. They do not write to the database.

Cards open game details. Authenticated owners additionally get log/edit links
and a link to search IGDB for new games. IGDB search/import remains a separate
owner-only operation requiring the credentials documented in
[IGDB catalog import](igdb-catalog-import.md). Closing search returns to Games.
The Discover page's Explore All Games link also opens the catalog.

## Verification

- `node --experimental-strip-types --test scripts/test-games-view.mjs` covers
  catalog/profile filter combinations, unlogged entries, independent tiers,
  nullable/zero scores, invalid ranges, sorting and non-mutating input behavior.
- Browser checks against the actual read-only catalog cover 24/8-card pagination,
  title search, empty status results, clearing filters, detail navigation, Discover
  navigation and search returning to Games.
- The open profile filter section and all five navigation tabs fit at 320, 390,
  640, 768, 1024, 1440, 1920 and 2560 pixels without horizontal page overflow.
  Mobile and desktop screenshots were visually inspected.
