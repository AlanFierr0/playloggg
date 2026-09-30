import dictionary from "./es-AR.json";
import type { SiteLocale } from "./preferences";

const translations: Record<string, string> = dictionary;
export function translateText(source: string, locale: SiteLocale): string {
  if (locale === "en") return source;
  const plain = source.replace(/\s+/g, " ").trim();
  if (!plain) return source;
  let translated = translations[plain];
  if (!translated) {
    const templates: [RegExp, (parts: RegExpMatchArray) => string][] = [
      [/^Browse all (\d+) saved catalog games, including titles you haven’t logged\.$/, (m) => `Explorá los ${m[1]} juegos del catálogo, incluidos los que todavía no registraste.`],
      [/^(\d+) of (\d+) games(?: · Showing (\d+)–(\d+))?$/, (m) => `${m[1]} de ${m[2]} juegos${m[3] ? ` · Se muestran ${m[3]}–${m[4]}` : ""}`],
      [/^Page (\d+) of (\d+)$/, (m) => `Página ${m[1]} de ${m[2]}`],
      [/^(\d+) logged titles grouped by independently selected tiers\.$/, (m) => `${m[1]} juegos registrados agrupados por niveles independientes.`],
      [/^(\d+) Titles Tracked$/, (m) => `${m[1]} títulos registrados`],
      [/^(\d+) Games Rated$/, (m) => `${m[1]} juegos puntuados`],
      [/^Showing (\d+)–(\d+) of (\d+)$/, (m) => `Se muestran ${m[1]}–${m[2]} de ${m[3]}`],
    ];
    for (const [pattern, replace] of templates) {
      const parts = plain.match(pattern);
      if (parts) { translated = replace(parts); break; }
    }
  }
  if (!translated || translated === plain) return source;
  const leading = source.match(/^\s*/)?.[0] ?? "";
  const trailing = source.match(/\s*$/)?.[0] ?? "";
  return leading + translated + trailing;
}
