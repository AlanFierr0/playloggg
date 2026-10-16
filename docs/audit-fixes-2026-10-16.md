# Application audit fixes — October 16, 2026

Scope: audit items 1–16. Items 17–19 remain outside this change.

| Item | Result |
|---|---|
| 1 | Removed the false private-default registration hint in English/Spanish. Actual public/discoverable defaults are unchanged. |
| 2 | Active visible comparison assertions were already fixed; independent browser shards now finish after another shard fails. |
| 3 | Completion scans pause on service limits, keep results, show a cooldown and retry AI-deferred checks. Valid text-rule evidence remains usable. |
| 4 | Campaign/ongoing choices persist with ratings and import drafts. Ongoing backlog entries no longer count as finishable; legacy null choices retain detection/status fallback. |
| 5 | Tagged All score rankings remain scored-only; explicit Backlog still includes unrated logs. |
| 6 | Selected game destinations survive password, email-link, Steam authentication and profile setup. External/auth/API redirects are rejected. |
| 7 | Each 25-game playtime sync resolves only that batch's exact Steam matches and owned entries, preserving timestamp guards. |
| 8 | Ranking, timeline, overview, favorites, tiers and statistics omit unused review prose. Review pages, editors and exports retain it. |
| 9 | Platform/score buttons, password recovery and Settings Back have larger touch areas; the score field keeps a usable width. |
| 10 | Timeline and orbit share the selected year and month counts. Orbit clicks no longer unexpectedly change the year. |
| 11 | Settings uses the shared site container; Visibility and Discovery appear together before unrelated settings. |
| 12 | Steam onboarding describes direct rate-all, Skip and resume rather than the removed choice screen. |
| 13 | A server-only, expiring database lease prevents duplicate cold-server translations of the same review/hash/language. |
| 14 | Partially complete: authenticated production inspection found no listed backups and PITR disabled. Scheduled off-site database/picture backups and a real isolated restore still require a private storage destination and credentials. |
| 15 | Removed the unreachable prototype game screen and unused search exports/image helper. Original design-reference assets remain. |
| 16 | Updated current developer instructions, production domain, timeline/import/translation/persistence and recovery documentation. |

Migration: `20261016113940_persist_game_type_and_claim_translations.sql`. The nullable game-type field is compatible with existing records; older save payloads preserve an existing choice. Translation claim functions are executable only by the service role, with no anonymous/authenticated table reads. Production schema and permissions were verified after application.

Regression coverage includes a 3,000-game library with exactly two bounded database reads per 25-game sync; concurrent cold translation workers making one provider call; saved ongoing backlog statistics; safe authentication destinations; deferred AI failures; and desktop/mobile quota pause/retry, game-type persistence and timeline scope. Real Postgres CI assertions cover old-client saves, invalid types, claim exclusion, expiration, foreign-token release denial and public-access denial. The existing CI database/picture recovery rehearsal uses dummy data and does not establish a production restore point.

See [data recovery](data-recovery.md) for the remaining operations work. Production records and pictures must never be uploaded to this public repository or its public CI artifacts.

Local verification: 136 unit regressions, 72 affected desktop/mobile browser cases, TypeScript, ESLint and the production-mode fixture build passed. The final Steam HTTP 429 branch has its own Retry-After regression; GitHub rebuilds and checks the complete change on every push. Real provider handshakes and a production restore were not exercised.
