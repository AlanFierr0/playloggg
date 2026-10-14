# Automatic review translation

DeepL is the owner-selected provider. Reviews translate into the selected English/Spanish app language when they become visible. Original text appears immediately and stays unchanged in the database and exports. Successful translations show a DeepL notice with Show original/Show translation; same-language results show the original without a misleading notice. Link-only reviews skip translation. URLs are excluded from provider input and reconstructed exactly. Provider errors, missing configuration, quotas and malformed responses keep the original visible.

The server fetches the real saved review through the viewer's normal RLS client, never accepts arbitrary submitted text and rechecks it after translation. Cached translations are private, keyed by profile/game/content hash/target, invalidated on review edits and cascaded away when a log/profile is removed. No browser receives the provider key. Concurrent reads of the same review coalesce in the server instance. New translations share 60/minute, 500/day and 500,000 monthly source-character ceilings; cached reads do not consume provider quota. The monthly ceiling is conservative and includes source links even though they are not sent to DeepL.

## Activation still needed

Add the owner-provided key as private server environment variable `DEEPL_API_KEY` in Vercel Production, then redeploy. Do not paste it into this repository, documentation, public environment variables or issue comments. Keys ending in `:fx` use DeepL API Free; other keys use API Pro, following the official endpoints. Check the provider account's own usage/cost controls before using a Pro key. A key may have been shared with other apps; the app's local ceiling cannot account for that external usage.

See [DeepL’s text API](https://developers.deepl.com/api-reference/translate/request-translation). Local/browser tests use a loopback provider fixture and cannot charge a real key. Production activated and verified on October 14, 2026: existing public reviews returned English and Spanish results, a fresh uncached request succeeded, and the live translated notice and Show original control worked.
