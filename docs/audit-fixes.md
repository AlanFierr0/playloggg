# Audit fixes - October 10, 2026

The requested must-fix and should-fix findings (1-14) are implemented.
Nice-to-have ideas remain outside this change.

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
Existing manual ranking lists retain their saved positions. Steam imports still
require the page to remain open. External Steam/IGDB outages are not simulated by
the fixture suite. Older documents under docs/ are historical unless reflected in
README and AGENTS.
