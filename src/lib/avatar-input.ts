export const avatarLimit = 2 * 1024 * 1024;
export function avatarFormat(bytes: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpeg";
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n)) return "png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP") return "webp";
  return null;
}
export function avatarPath(value: unknown): value is string { return typeof value === "string" && /^[1-9]\d{0,14}\/[a-f0-9-]{36}\.webp$/.test(value); }
export function avatarSource(id: number, path: string | null) { return avatarPath(path) ? `/avatars/${id}?v=${path.split("/")[1]}` : null; }
