# Public launch (step 7)

## Approved scope

The canonical origin is `https://playloggg.vercel.app`. Discover remains curated,
using the existing selected game slugs and stored catalog metadata. Missing picks
are omitted; an empty selection links to the catalog. No invented editorial
scores, quote, community counts or dates are displayed. Its selection is labeled
editorial and never presented as the visitor's ratings or a community ranking.

The owner approved hiding invented community/review/statistics sections and
unavailable controls on original game pages and the tier board. The existing
hero, entry, typography and tier layouts remain, with catalog metadata and real
saved entries. Generated imagery has not been restored. No profile directory or
automatic profile discovery has been added.

## Search and sharing

Root metadata defaults to `noindex, nofollow`. Anonymous Discover, unfiltered
Games and valid catalog game details opt into indexing. Filtered Games and
signed-in catalog responses are noindex. Profile pages (even published), account
pages, search, comparison, private rankings/tiers/lists and missing pages stay
noindex. Publishing remains a visibility choice, not indexing/directory consent.

Catalog canonical URLs use the production origin and exclude filters/query
parameters. Published profile, tier, list and game-entry pages use their own
canonical URL and publicly readable titles, with no private reviews or Auth
information in metadata. Game share cards use the stored game title/cover.
Private/unknown profiles return the same unavailable metadata and 404.

The sitemap contains only Discover, Games and stored catalog detail URLs. It is
generated dynamically so imports are reflected through normal catalog cache
invalidation. No profile handles, search queries or account routes are included.
Do not invent last-modified timestamps on every request. Split sitemaps before
the catalog reaches 50,000 URLs.

Robots allows page crawling so crawlers can read noindex, while excluding auth
callbacks. Robots/noindex are search-engine instructions, not access control;
Auth and RLS still protect private data. Blocking a page in robots can prevent
Google from seeing its noindex directive. See [Google's noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).
Indexing is eligible, not guaranteed, and removal of previously indexed content
requires the crawler to revisit it. Preview environments should stay protected
by their hosting configuration; the approved canonical origin remains production.

## Verification and remaining operations

The fixture suite checks canonical/robots tags, catalog-only sitemap entries,
private metadata, removal of placeholders, mobile overflow, sharing, and the
save/publish/guest-read/unpublish journey. Existing tests cover both languages,
both themes, keyboard/contrast, rankings, tiers, catalog filters and comparison.
Steam/provider sign-in was verified in the earlier production acceptance report;
it is not simulated as a proof of the real provider in the fixture suite.

See [data operations plan](data-operations.md) for export, deletion and backup
procedures. These are operator procedures, not new self-service controls or an
approved retention/privacy policy. No production deletion, backup restore or
account transfer was performed in this milestone. Terms/Privacy/API footer links
remain hidden under the existing decision until approved destinations/text exist.
