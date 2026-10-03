# Editing tiers on the board

The owner can drag a logged game to S/A/B/C/D/F or Unassigned on `/tiers`.
Desktop cards support native drag and drop; the grip supports pointer capture,
including touch, and scrolling near the viewport edges. Escape or pointer
cancellation keeps the original tier. Target rows highlight during dragging.
Each card also has a labeled native tier selector for keyboard and touch use.
Game title links remain available. Published boards are read-only.

Changes save automatically. The action verifies Auth ownership, resolves the
catalog slug and updates only the tier and update timestamp of an existing owned
entry. It cannot create a log or overwrite score, status, review, platform,
playtime, date, tags, favorites or preference ranking. No migration or new RLS
grant is needed. Other edits wait while a tier is saving; failure leaves the
previous tier visible and announces the error. Success refreshes saved groups.

Browser fixtures cover native drag, pointer movement/cancellation, keyboard
selection, removing assignment, reload persistence, failed writes, preservation
of other fields/accounts, public read-only boards and accessibility.
