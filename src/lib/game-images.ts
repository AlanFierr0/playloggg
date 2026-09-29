import images from "@/data/game-images.json";

type GameImages = { cover: string; artwork: string | null; source: string | null };
const catalog: Record<string, GameImages> = images;

// Reviewed game-specific images for illustrative editorial/comparison cards.
// Connected game cards use the live catalog cover supplied by their Game prop.
export function gameImages(slug: string): GameImages {
  const image = catalog[slug];
  if (!image) throw new Error(`No reviewed images for ${slug}.`);
  return image;
}
