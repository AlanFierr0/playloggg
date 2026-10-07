# Live-service playback statuses

Add Currently playing (`active`), Paused (`paused`) and Stopped playing (`stopped`)
alongside Completed, In Progress, Backlog and Shelved. Existing entries retain
all values. These choices are available for every game, independently of score
and tier, in full/bulk editing and Steam import ratings. Games filters and chips
use the same labels; home Continue playing includes both playing and active.
Stats count each new status separately. Null still means no status.

Migration 20261007154420_live_service_playback_statuses extends the existing
ratings status constraint. Grants, RLS and ownership checks are unchanged.
Verification accepts the seven statuses and null and rejects an unknown value
in a temporary copy of the real table, rolled back without modifying entries.
Native checks cover full/bulk validation and catalog parsing/filtering. Owner
and Steam browser checks cover saved/reloaded values and preserved score/tier,
review and playtime on desktop/mobile.
