# Playlogg: your gaming identity

This roadmap replaces backup/recovery as the next development priority. The user
cancelled the proposed Step 8 operations work. The earlier seven-step launch
roadmap remains a historical record; its operational follow-ups are deferred.

## Product direction

Playlogg helps people express, understand and compare their gaming taste.
Profiles, 0-100 scores, independent tiers, personal rankings and taste comparison
are the core product. Backlog tracking supports that identity.

Before adding a feature, ask: does it help people express, understand or compare
their gaming taste?

The five highest-priority improvements are Public Profile v2, Compare v2, Taste
Fingerprint and personal stats, quick rating, and a Discover redesign. The phased
order below establishes the data needed to make those features truthful.

## Current status

Profile v2 and the navigation foundation are implemented with the approved
unlimited favorites and ordered featured Top 4. Optional bio/location/platform
preference, current reviews, entry updates and basic stats are included. See
[Profile v2](profile-v2.md). Quick rating and the deeper taste engine remain next.

## Foundation at the start of this roadmap

- Steam accounts have separately owned profiles, private by default. Publishing
  exposes their entries and lists through anonymous reads with publication checks.
- Entries store optional scores, independent tiers, playback details, tags and
  one current review. There is no independent favorite or personal ordering yet.
- Rankings currently sort score descending, then game slug. An independent
  preference ranking requires new persistence rather than relabeling that order.
- Catalog data includes genres and IGDB metadata. Do not assume it supplies
  reliable narrative, difficulty, indie/AAA or game-length classifications.
- Compare uses two published handles and actual shared entries. Its existing
  affinity is 100 minus mean absolute score difference, with five shared scored
  games required. Changes to this formula need an explicit decision.
- Entry timestamps exist, but public/domain reads do not yet carry them. A current
  row's update time is not an activity history or the time a score was first set.
- Profiles currently emphasize rankings. Navigation exposes Discover, Games,
  Rankings, Lists and Compare. Avatar rendering currently uses initials.
- Dark/light themes, Argentine Spanish/English, responsive layouts and fixture
  tests already exist and must cover the new screens.

## Phase 1: make profiles worth sharing

### 1A. Public Profile v2 and favorites

Implemented with the approved scope; image uploads remain deferred.

1. Agree on the favorite model and initial customization scope. Recommended:
   unlimited independent favorites with an ordered featured Top 4; bio and
   optional location/platform preference; defer custom image uploads.
2. Inspect the actual database before designing versioned migrations. Preserve
   per-profile ownership, private defaults and publication-based public reads.
   Never populate favorites from scores/tiers or transfer sample entries.
3. Add persistence and owner controls for the agreed fields. Decide whether
   favoriting an unlogged catalog game creates an entry before implementing it.
4. Make profile Overview the primary view, with a strong identity header, featured
   covers, rated/completed counts, average score and favorite count. Empty and
   small portfolios must remain useful without invented metrics.
5. Keep Ranking, Tier List, Lists, Reviews and Stats as profile sections. Build
   only functional sections; do not ship placeholder tabs for later features.
6. Show recent entry updates using accurate timestamp labels. If "Recently
   Rated" means score-change activity, record that event explicitly; never infer
   a historical tier move or favorite event from the latest row.
7. Verify private/unknown nested pages, owner edits, public reads, both languages
   and themes, keyboard operation and desktop/tablet/mobile layouts. Push tested
   milestones to main for automatic deployment.

Completion: a profile communicates its owner's taste, independent favorites
persist, and shared pages expose only deliberately published data.

### 1B. Navigation and rating concepts

Use Discover, Games, Profile and Compare as the main navigation. Keep existing
URLs usable while moving profile-related destinations into profile navigation.
Preserve login/account access, search and both display toggles on small screens.

Explain the three independent concepts:

- Score: how good do you think the game is?
- Tier: how much does the game mean to you?
- Ranking: where do you prefer it among your other games?

Until independent ordering is implemented, label the existing ordering as a
score ranking. Pairwise choices must not silently rewrite scores or tiers.

### 1C. Quick rating

Provide a fast search-to-entry flow: game, optional status, score, tier,
favorite and review. Keep playtime and other detailed fields optional. Reuse
verified ownership and validation rather than adding a separate write pathway.
Preserve drafts and make failures/repeated submissions clear.

Decide any new Played/Wishlist statuses separately from existing persisted
statuses. Verify a realistic batch of 20-30 entries before claiming the flow is
fast enough. Do not use production user records as disposable test data.

## Phase 2: taste fingerprint and personal statistics

1. Begin with supported catalog facts: genres, developers/publishers where
   available, release eras, scores, saved platforms and completion status.
2. Define formulas, minimum sample sizes, overlap handling for multi-genre games
   and unknown-data treatment before publishing percentages or identity labels.
   A genre average, share of rated games and compatibility are different metrics.
3. Add rating distribution (0-49, 50-59, 60-69, 70-79, 80-89, 90-100), genre/studio
   averages and counts, score behavior relative to the personal average, era
   breakdowns, platform preferences and completion/dropped rates.
4. Introduce behavior-based labels only when data supports them. Do not infer
   "Narrative First", "Indie Explorer", difficulty or typical game length from
   unsupported metadata. Make sparse-data states and label explanations visible.
5. Present a compact fingerprint on Overview and deeper details in Stats.

Completion: every displayed identity claim can be traced to the person's saved
entries, documented catalog facts and an explained calculation.

## Phase 3: Compare v2

1. Define Taste Match and whether it preserves or replaces the existing affinity
   formula. Explain overlap and confidence; never imply unplayed from unrated.
2. Lead with names, match, shared scored/logged counts and average score difference.
   Show biggest agreements/disagreements, the extreme disagreement and shared
   independent favorites with deterministic tie handling.
3. Add score correlation and an accessible scatter plot. Handle insufficient
   samples and constant scores, where correlation is undefined.
4. Define genre compatibility and recommendation exchange. Distinguish games not
   logged, not rated and not completed; recommendations are suggestions rather
   than claims of unseen play history.
5. Design square/story/landscape comparison cards only from published data.
   Maintain fresh anonymous publication checks for pages and exported cards.

Completion: two public profiles produce understandable, verifiable comparison
results, with honest sparse-data and privacy behavior.

## Phase 4: discovery

Redesign the homepage around "Build your gaming identity": rate games, rank
favorites and compare taste. Use a create-profile CTA with a useful signed-in
destination. Retain editorial content as a secondary section.

Featured profiles, taste neighbors, public-figure profiles and profile exploration
require a separate opt-in directory/discoverability design: existing publication
does not imply directory consent. The previously approved no-directory/noindex
policy stays in place until changed explicitly.

Define population, time window, minimum samples and privacy rules for trending
games, popular lists, recent reviews, high-variance controversial games, consensus
and hidden gems. Aggregate only eligible published data and handle unpublishing.
Do not invent community scores or pad empty sections with sample activity.

Taste recommendations should explain their real source: compatible people,
shared favorites and supported genre/studio preferences. Require enough actual
users/ratings before making percentages or community recommendation claims.

## Phase 5: sharing and lightweight social growth

1. Export Top Games, tiers, fingerprint and comparison cards in 1:1, 9:16 and
   16:9 layouts. Use reviewed cover art, readable typography and real values.
2. Extend lists with descriptions, artwork-based covers and ranked/unranked mode.
   Agree on list-specific visibility before changing the existing rule that
   lists follow profile visibility. Likes/comments need separate ownership rules.
3. Design Gaming Wrapped around recorded yearly activity. Release year and a
   current entry's update time cannot establish when a person played/rated a
   game. Record suitable events before promising yearly histories or surprises.
4. Add following and a lightweight feed only after defining discoverability,
   visibility changes, activity retention and unfollow/block expectations.
   Followers/following counts stay absent until real social records exist.

## Later: independent and pairwise rankings

Agree on eligible games, ties, skipped choices, contradictory preferences and
the ordering algorithm before implementing quick pairwise ranking, conflict
resolution or calibration. Persist preference ordering separately from scores,
tiers and favorites. Explain uncertain ordering instead of presenting a few
random comparisons as a fully calibrated rank.

## UI principles across all phases

Preserve the existing editorial identity while simplifying UX copy to Overview,
Taste Match, Shared Taste and Games. Dark mode stays the default; light mode and
Argentine Spanish remain fully supported.

Posters, strong titles and consistent scores/tiers establish hierarchy. Use
spacing before adding borders, progressive disclosure for detailed statistics
and one dominant purpose per page. Review the existing tier colors rather than
silently choosing a new palette.

Game-detail redesign follows the new data model: cover, title, year, developer,
personal score/tier/status and favorite action first; technical information lower.
Community scores and Reviews/Ratings/Lists/Stats tabs require real supporting
data and functional destinations before appearing.

## Pending decisions and deferred work

The product direction and phased priorities come from the user's supplied plan.
Alternative favorite formats, customization, formulas, new statuses, independent
ordering, discoverability and social access are proposals until agreed at their
milestone. Ask before consequential choices, then proceed with routine
implementation, verification, push and automatic deployment.

Backup scheduling, restore exercises, personal export/deletion UI and the second
Steam-account acceptance check are not part of this new Phase 1 scope. The
existing operations runbook remains reference material rather than enabled work.
