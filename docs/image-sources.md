# Game image sources

The user requested correct game images and removal of generated Stitch artwork.
Ranking, tier, search and editor cards now use each live catalog game's cover.
Detail backgrounds use the selected game's artwork, with no unrelated fallback.
Home/editorial and illustrative comparison cards use reviewed images in
`src/data/game-images.json`. No generated Stitch image URL remains in `src`.

The 32 catalog games use the existing reviewed IGDB snapshot and game IDs in
`supabase/igdb-games.json`. Each image manifest entry includes its source page.
The two comparison-only classics use verified box art from these pages:

- [Metal Gear Solid 3: Snake Eater](https://en.wikipedia.org/wiki/Metal_Gear_Solid_3:_Snake_Eater)
- [Super Mario Bros. 3](https://en.wikipedia.org/wiki/Super_Mario_Bros._3)

[IGDB image documentation](https://api-docs.igdb.com/#images) describes the image
IDs and sizes. Application cards use covers; landscape features use artwork or
screenshots of the same game. Imported image metadata is never replaced with
a fabricated scene.

Profile portraits use accessible initials without inventing a photograph.
The existing wordmark remains, paired with the existing game-controller icon.
Original Stitch exports remain untouched in `design-reference` as historical
references. Active fixtures and the reproducible demo seed also use real covers;
the seed has no fabricated profile portrait. No live database records were
modified for this image change.

Verification: all 66 distinct cover/artwork URLs return successful image responses.
TypeScript, lint, production build, fourteen existing input/data tests, and seed
reproducibility pass. An isolated browser/API checked home, profile, tiers,
search, comparison, two different game detail backgrounds, and the editor.
Generated image URLs are absent from those rendered screens. Mobile screenshots
were inspected; the checked layouts have no horizontal overflow or runtime errors.
