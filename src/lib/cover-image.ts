// IGDB already resizes at its CDN; keep private avatars and other hosts untouched.
export function coverImage(src: string, sizes: string) {
  const match = /^(https:\/\/images\.igdb\.com\/igdb\/image\/upload\/)t_[a-zA-Z0-9_]+\/([a-zA-Z0-9_-]+)\.(?:jpg|png|webp)$/.exec(src);
  if (!match) return {src};
  const url = (size: string) => `${match[1]}t_${size}/${match[2]}.webp`;
  return {src: url("cover_big"), srcSet: `${url("cover_small")} 90w, ${url("cover_big")} 264w, ${url("cover_big_2x")} 528w`, sizes};
}
