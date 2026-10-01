export function emailAddress(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.endsWith(".invalid") ? email : null;
}
export function passwordValue(value: unknown): string | null {
  return typeof value === "string" && value.length >= 12 && value.length <= 128 ? value : null;
}
