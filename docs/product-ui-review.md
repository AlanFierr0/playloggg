# Product and UI document review

Source: the user-provided `F:/Alan/playlogg_product_ui_improvements.md`.
Direction: express, understand and compare gaming taste. This review distinguishes
shipped behavior from proposals requiring additional data or product decisions.
The existing dark/gold typography, real IGDB artwork, responsive site containers,
English/Argentine Spanish and light mode remain the visual foundation.

## Document coverage

| Suggestion | Implementation / boundary |
| --- | --- |
| Public Profile v2 | Overview with picture, names, optional bio/location/platform preference, counts, independent featured Top 4, taste summary, recent updates/reviews, lists, and Ranking/Tier/List/Review/Stats sections. Custom banners are not added. |
| Compare v2 | Taste Match, shared count, mean score difference, Pearson correlation, agreements/disagreements, shared independent favorites, genre compatibility, score scatter and mutual game suggestions. The largest disagreement represents the strongest disagreement; no invented community claims. |
| Taste Fingerprint | Actual genre and studio averages/counts with three scored games required per preference group. Stats also expose publishers, score behavior, release eras and played platforms. Unsupported narrative/indie/difficulty/expected-length classifications are not guessed. |
| Quick Rating | `/quick-rate`: search, optional score/tier/status/review, retained drafts while switching games, independent favorites, full-editor link. Preserves existing playback details/tags on quick saves. |
| Pairwise Ranking | Logged games only; alphabetical unsaved draft, editable saved order, adjacent pair choices, Skip, explicit save and optimistic revision checks. A choice moves its winner immediately above its opponent. Scores/tiers/favorites do not change. |
| Score/Tier/Ranking distinction | Explanations in quick/full editors and ranking. Score is 0–100, tier is independent personal meaning, favorites are independent selections, preference ranking is saved ordering. Existing score-sorted ranking stays separately labeled. |
| Discover redesign | Identity hero, profile creation/open-profile CTA, opt-in profile directory, real catalog artwork, trending, controversy, taste suggestions, popular public lists and current public reviews. Spotlight remains removed. |
| Simple copy | Taste Match, Shared Taste, Search, Profiles, Tier List and Your game entry replace the affected archival terminology. Original design references remain untouched. |
| Navigation | Discover/Games/Profile/Compare remain top-level; profile sections retain their existing routes. Quick rating, yearly summary, feed and connection management are linked from the owner's overview. |
| Lists | Descriptions, automatic four-cover collage, ranked/unranked display, own public/private setting, signed-in likes and PNG export. Comments remain deferred by agreement. |
| Favorites | Unlimited favorites, optional ordered featured Top 4, including unlogged catalog games. No rating/status is created by favoriting. |
| Personal statistics | Actual rating buckets, genre/studio/publisher averages and deviation from personal mean, 90+ share, completion and shelved counts, release decades, saved played platforms. No unsupported franchise/expected-length metrics. |
| Recently Rated | Current entry updates remain labeled Recently updated entries. New trusted events separately record score/completion changes, so ordinary review edits do not pretend to be first-time ratings. |
| Social | Follow/unfollow, block/unblock management, and a feed of followed discoverable public profiles. Unpublishing/leaving discovery removes activity; blocking excludes it from the personal feed and recommendations. |
| Taste recommendations | Games not logged by the recipient, scored 90+ by opted-in profiles with 85%+ Taste Match across at least five shared scored games. Counts and strongest eligible match shown. Taste neighbors show the actual shared-game count using the same overlap/match requirements. Not logged is not a claim that the game was never played. |
| Share cards | PNG exports for favorites, tiers, taste, lists, comparisons and Year in Gaming, at 1080×1080, 1080×1920 and 1920×1080. Cover art has a text fallback. Exports are finite visual highlights, with represented/total count when truncated. Personal score-difference cards compare against community averages with at least five ratings. |
| Game details | Real artwork/title/developer, personal score/tier, independent favorite controls and eligible community average emphasized near the top; log controls, overview and screenshots remain functional. No empty placeholder Reviews/Ratings/Lists/Stats tabs. |
| Density | Covers and typography lead, compact summaries link to deeper stats, pairwise controls are expandable, optional reviews are collapsed. Future large-portfolio performance is an explicit follow-up. |
| Dark mode | Existing dark default preserved; light/EN/es-AR remain available. |
| Gaming Wrapped | Owner-only `/profile/wrapped?year=2026`, trusted launch-forward UTC history, distinct scored/completed/favorited games, last recorded score per game in the year, highest recorded score, monthly activity and export. No guessed surprises/disappointments or retrospective history. |

## Agreed calculations and privacy

- Zero is a valid score; null is unscored. Mean values use scored entries only.
- Multi-genre titles count once in each supplied genre. Unknown metadata is
  excluded rather than classified. Preferences need three scored games/group.
- Taste Match = `100 − mean(abs(leftScore − rightScore))`, rounded to one decimal,
  with five shared scored games. Correlation needs three pairs and nonzero
  score variance on each side; correlation and match measure different things.
- Genre compatibility uses 100 minus the difference in each side's genre mean,
  requiring three scored games per side in that genre. This is not a statistical
  confidence estimate. Sample sizes are displayed.
- Community scores require five distinct scored profiles. Controversy sorts
  population standard deviation. Trending counts distinct profiles with trusted
  score-change events in the previous 30 days, not repeated edits or release dates.
- Discovery needs both publication and its separate opt-in. Unpublishing clears
  discovery consent. Community reads use an anonymous client and fresh eligibility
  checks. Owner-only data must never contribute to public aggregates.
- Lists start private; a public list still requires a public profile. Publishing
  a profile does not publish its private lists. Anonymous like counts expose only
  public-list IDs/counts, never the identities of people who liked them.
- Rankings/list revisions prevent overwriting concurrent saves. Activity inserts
  are trusted database triggers; application clients have no activity-write grant.
- Export endpoints return no-store responses and recheck published profile/list
  visibility. PNG files already downloaded cannot be revoked by unpublishing.
- Blocking stops following and excludes feed/recommendation interactions. It does
  not turn a publicly shared portfolio into a private resource.

## Persistence and verification

Applied additive migrations:
`20261001230728_product_identity_expansion.sql`,
`20261001231647_activity_change_markers.sql`,
`20261001233950_public_list_like_counts.sql`.
Generated database types reflect the live schema. No demo profiles or history
were seeded. `supabase/verify-product-identity.sql` checks ownership, logged-only
ranking, visibility, blocking and trusted activity in a rolled-back transaction.

Unit coverage includes zero/null scores, minimum samples, trend deduplication and
window boundaries, recommendation thresholds, correlation and yearly score-change
semantics. `e2e/product-expansion.spec.ts` covers the 20-game rating flow, draft/error
retention, pairwise saves, discovery consent, list metadata/mode, social controls
and actual exported PNG dimensions using isolated fixtures, not real user writes.
Browser fixtures are contract doubles; production RLS is verified separately in SQL.

## Next improvements

1. Review these flows with real voluntary opted-in profiles. Until that data exists,
   show truthful empty states; do not repopulate deleted demo profiles.
2. Expand share-card layouts after reviewing exports with real artwork and
   representative portfolios; preserve visibility checks and explicit sample sizes.
3. Move community aggregation to bounded SQL queries/materialized processing when
   community volume warrants it; current reads are fresh and paginated but compute
   aggregates in the application. Preserve opt-out freshness when optimizing.
4. Agree on curated reliable metadata before adding narrative/indie/difficulty,
   franchise, multiplayer or expected-length fingerprints. Do not infer these
   categories from marketing prose or platform support.
5. Consider banners, public-figure verification, hidden-gem
   minimum samples and comments as separate product decisions. List comments remain
   deferred; no full social network or fabricated feed is introduced.

Verification completed: 78 unit cases; desktop/mobile regression coverage, including
eight accessibility audits across English/Argentine Spanish and dark/light themes.
The initial full browser run passed 66/68 cases; two assertions still expected the
old publishing message. After correcting those assertions, the targeted rerun
passed both favorites cases plus new likes/taste-neighbor and share-export checks.
No application failures remain from those runs. Production retains 1,000 games,
zero profiles and zero recorded activity following the user's earlier deletion.
