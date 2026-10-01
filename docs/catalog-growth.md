# Catalog and profile growth — step 5

## Rating reads

Selected authenticated profiles and the published sample now read ratings in
stable `game_id` order, 500 rows per request, instead of stopping at 1,000.
Authenticated reads retain the verified account's `profile_id` filter and normal
Supabase client/RLS. Sample reads retain the explicit Alex Vance filter on every
page. Public portfolios already paginate and recheck publication after reading.
No schema, grants, auth design, or credentials changed.

Tests cover zero entries, an exact page boundary, 1,001 and 1,501 entries, zero
scores/hours, independent null tiers, sample scoping and a failed later page.
Offset pagination is not a database snapshot; concurrent insertions/deletions
may affect a multi-request read. A failure never silently returns a partial list.

## Baseline payload estimate

Run `node scripts/measure-catalog-growth.mjs` from the repository root. It uses
synthetic metadata with an approximately 1,600-character description and six
screenshots per game, transformed by the actual `portfolioGames` function.
These are uncompressed JSON estimates, not measured production network traffic,
latency, database query cost or a benchmark of the current small catalog.

| Games | Full game JSON | Compact card JSON | Server page JSON | 500-row catalog requests |
| --- | ---: | ---: | ---: | ---: |
| 100 | 260,261 bytes | 27,361 bytes | 4,823 bytes | 1 |
| 1,000 | 2,606,561 bytes | 277,561 bytes | 4,892 bytes | 3 |
| 5,000 | 13,050,561 bytes | 1,405,561 bytes | 4,953 bytes | 11 |

The previous root layout supplied a full portfolio to every route, shipping
descriptions/screenshots even when a page only needed identity or cards. Compact data reduces this estimate by about 89%; paginating
cards on the server can also prevent client payload from growing with catalog size.

## URL state

`games-query.ts` defines bounded, typed filters and pagination for shared URLs.
It preserves zero score bounds and leaves bounded invalid score input visible so
validation can explain an empty result. Unknown enum values reset to defaults.
Query keys: `q`, `genre`, `platform`, `year`, `library`, `status`, `tier`, `rating`,
`minScore`, `maxScore`, `sort`, and `page`. Default values are omitted.
The Games screen renders server-filtered results and writes each filter/page
change into the URL. Reload, shared links and Back/Forward retain the view.
Changing a filter resets the page; out-of-range pages display the final available
page. Unknown genre/platform values remain visible with an empty result.

## Implemented architecture and limits

The approved option uses server filtering with 24 cards per page. Only those
cards and catalog facets reach the Games client component; descriptions, reviews
and screenshots are excluded. The root layout loads only identity/access data.
Detail and editor routes fetch one full game and one selected-profile rating.
Rankings, tiers, search and list builders request compact catalog metadata only
where they need it. Public portfolio reads retain anonymous RLS and publication
checks, including per-game pages.

Filtering currently runs on the application server against the shared compact
catalog cached for 60 seconds, with 500-row database reads. It is not indexed
SQL filtering: server metadata processing and facet size still grow with the
catalog. Search/list builders and public portfolio screens still receive compact
catalog data. Selected-profile rating reads remain request-local, preserving
profile ownership; no private ratings enter the shared catalog cache.

The synthetic estimate justifies reducing payloads; it does not prove a production
latency target. Consider indexed database filtering when catalog growth makes
server metadata reads material. No dependencies, schema or access rules changed.

Verification covers 5,000 cards, a bounded 24-card payload, the final partial page,
invalid filters, empty states, more than 1,000 ratings and later-page failures.
Browser checks cover desktop/mobile URL filters, pagination, reload and history,
plus the existing localized, accessible and authenticated journeys.
