export function favoriteInput(form: FormData) {
  const slug = form.get("slug");
  const operation = form.get("operation");
  const slot = form.get("slot");
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200) return null;
  if (operation !== "add" && operation !== "remove" && operation !== "feature") return null;
  if (operation === "feature" && slot !== "" && !["1", "2", "3", "4"].includes(slot as string)) return null;
  return { slug, favorite: operation !== "remove", featuredSlot: operation === "feature" && slot ? Number(slot) : null };
}
