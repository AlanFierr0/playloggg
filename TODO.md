# TODO

- [ ] Automatically translate displayed reviews into the selected app language (English or Spanish).
  - DeepL is selected. Provider, private cache, visible-review translation, original toggle, exact URL preservation and failure fallback are implemented. The owner chose to configure the key later. Production activation awaits the owner’s API key as private `DEEPL_API_KEY` in Vercel; never use a NEXT_PUBLIC name.
  - Profile reviews, game-page reviews, community game reviews and the home review carousel use the shared renderer.
  - Show a translated notice and a “Show original” toggle only after translation succeeds.
  - Preserve the original saved review and YouTube source URLs; leave URL-only reviews unchanged.
  - Keep the original text visible if translation is unavailable or fails.
