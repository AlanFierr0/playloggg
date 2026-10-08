# TODO

- [ ] Automatically translate displayed reviews into the selected app language (English or Spanish).
  - Choose and configure a translation provider; DeepL is proposed but not yet selected. Store its API key privately in Vercel.
  - Cover profile reviews, game-page reviews, and the home review carousel.
  - Show a translated notice and a “Show original” toggle only after translation succeeds.
  - Preserve the original saved review and YouTube source URLs; leave URL-only reviews unchanged.
  - Keep the original text visible if translation is unavailable or fails.
