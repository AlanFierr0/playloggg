# Audit fixes - October 10, 2026

The requested must-fix and should-fix findings (1-14) are implemented.
Nice-to-have findings 15, 16 and 19 are also implemented.

| Finding | Result |
|---|---|
| 1. Community averages | All non-null scores contribute anonymously, including private profiles; no minimum. |
| 2. Stale entry saves | Atomic timestamp comparison rejects older editors and retains their drafts. |
| 3. Personal ranking | Score order is the fallback; only manually moved games retain fixed positions. |
| 4. Future completion dates | Calendar, editor, server validation and guarded save reject future dates. |
| 5. 404 checks | Assertions match the current custom 404. |
| 6. Excessive loading | Catalog/search/discovery batches are bounded; profiles/comparisons fetch metadata only for their entries and favorites. |
| 7. Draft loss | Tab-local drafts survive navigation/refresh, including invalid date text; canceling game selection returns to the original editor. |
| 8. Steam preview | Loaded batches appear immediately and can be selected while later batches load. |
| 9. Tier timestamps | Range recalculation touches only games whose automatic tier actually changes. |
| 10. Review sources | HTTP/HTTPS URLs are clickable and open safely in another tab. |
| 11. Duplicate ranking views | Personal order and score ranking have distinct views; public identity is not repeated in the ranking header. |
| 12. Retired UI | Unused lists/quick-rating components removed; activity route retired. Production records retained. |
| 13. Contradictory docs | README and AGENTS describe the current persisted application and route inventory. |
| 14. Unknown playtime | Missing totals show a dash; recorded zero remains zero, with coverage shown. |

## Database verification

Verified live anonymous averages against direct sums/counts. Catalog first batch:
25 of 3,007 games; search batch: 25; discovery batch: 9. Browser roles cannot call
server-only aggregate/catalog functions. Authenticated ownership checks work.

Transactional checks used only the private testing account and rolled back all
writes. They verified stale-save rejection, future-date rejection, manual ranking
positions and selective tier recalculation without timestamp changes to other games.

## Local verification

Production build, type checking and lint pass (27 existing warnings, no errors).
All 97 unit tests pass. The full desktop/mobile run plus corrected-area reruns
verify 245 distinct browser scenarios; one existing desktop scenario is skipped.
GitHub browser-job timeout increased to 30 minutes for the expanded suite.

## Limits

Editor drafts use sessionStorage in the same tab; they are not cross-device backups.
Existing manual ranking lists retain their saved positions. Steam import queues pause when leaving and resume in the same browser.
Imports do not run while the browser is closed. External Steam/IGDB outages are not simulated by
the fixture suite. Older documents under docs/ are historical unless reflected in
README and AGENTS.

## Requested nice-to-have improvements

- 15: Nintendo Switch/Switch 2, Wii/Wii U, GameCube, N64, NES/SNES and handhelds; Sega, Android, iOS and browser choices. Shared validation and database constraint accept all choices.
- 16: Per-profile browser checkpoints save pending Steam IDs and rating choices before requests. Resume/Discard controls recover interrupted imports without changing existing entries; blank PC imports can rejoin rating when their response was lost.
- 19: Ongoing statuses (currently playing, paused, stopped playing) have a separate summary and are excluded from finishable-game completion. Classification follows the user's status; no genre guess or historical rewrite.

### Verification for 15, 16 and 19

Production build, type checking and lint pass; all 99 unit tests pass.
All 20 targeted desktop/mobile scenarios pass across the final run and isolated
rerun: eight new platform/statistics/import-recovery scenarios and twelve Steam
regressions. One desktop reload timed out on external resources and passed on
retry. The platform migration was applied and verified live in a rolled-back
transaction against the private test profile.

## Second audit: must and should fixes (1–13)

1. Database launch/date/hour guards; whole-entry replacement uses the owned timestamp RPC. Direct permissions permit only blank Steam inserts and narrow tier/playtime patches. Every update advances its database timestamp, including playtime sync.
2. Review text changes invalidate votes; unrelated edits retain them.
3. Ranking drafts survive navigation/refresh in the same tab, with explicit retry/discard and conflict acknowledgement.
4. Search reads lightweight own ratings only for its 24 results. Provider results exclude previously scored games in Log mode.
5. Home reads at most 12 ranked reviews, six neighbors and five recommendations. No per-profile helpfulness fanout.
6. Optional community/exploration failures preserve core home and show an availability message.
7. Invalid hidden score ranges become visible and focused.
8. Discovery settings distinguish browsing/recommendations from public name search.
9. Personalized exploration uses seeded rotation and the existing ten-minute/token expiry.
10. Ranking edits are optimistic; queued changes coalesce behind the current save without changing scores.
11. Removed retired collection/bulk/year helpers and dead social options; kept stored records and migrations.
12. Comparison highlights show unique game cards with honest relative-score labels.
13. Hot take requests community scores only for the viewed profile’s scored games.

The database rollout adds compatible functions and triggers first, deploys the updated Steam save/import callers, then restricts direct rating writes. Launch/date/hour and review-vote checks run in a rolled-back transaction; no existing entries or votes are rewritten.

### Second-audit verification

Production build, type checking and lint pass (27 existing warnings, no errors).
All 96 remaining unit tests pass after removing tests for retired features.
All 72 targeted desktop/mobile browser scenarios pass, including queued ranking
saves, refresh recovery, two-tab conflicts, hidden range validation, bounded search,
home failure handling, Steam imports/linking/sync, comparisons and profile identity.
Additional desktop regressions cover tier dragging/ranges, review voting and unified
search. A local browser network-buffer failure passed on rerun; it was not an app error.
Database checks confirm owned timestamp guards, review-vote invalidation and date/hour
validation in rolled-back transactions, plus bounded public review results and
restricted home-query permissions. Full-scale load testing is not part of this pass.
