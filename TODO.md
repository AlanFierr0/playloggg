# TODO

- [x] Automatically translate displayed reviews into the selected app language (English or Spanish).
  - DeepL is selected. Provider, private cache, visible-review translation, original toggle, exact URL preservation and failure fallback are implemented. Activated in production on October 14, 2026 using private `DEEPL_API_KEY` in Vercel. Fresh provider responses, the translated notice and Show original were verified; never use a NEXT_PUBLIC name.
  - Profile reviews, game-page reviews, community game reviews and the home review carousel use the shared renderer.
  - Show a translated notice and a “Show original” toggle only after translation succeeds.
  - Preserve the original saved review and YouTube source URLs; leave URL-only reviews unchanged.
  - Keep the original text visible if translation is unavailable or fails.
