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
      [/^(20\d{2}) Year in Gaming$/,m=>`${m[1]} en videojuegos`],
      [/^Biggest agreement: (.*)$/,m=>`Mayor coincidencia: ${m[1]}`],
      [/^Biggest disagreement: (.*)$/,m=>`Mayor desacuerdo: ${m[1]}`],
      [/^Signed in as (.*)\.$/, (m) => `Iniciaste sesión como ${m[1]}.`],
      [/^← (.*)'s portfolio$/, (m) => `← Colección de ${m[1]}`],
      [/^(.*)'s log entry$/, (m) => `Registro de ${m[1]}`],
      [/^(.*) screenshot (\d+)$/, (m) => `Captura ${m[2]} de ${m[1]}`],
      [/^Released (\d{4}-\d{2}-\d{2})$/, (m) => `Lanzado ${m[1]}`],
      [/^Import (.*)$/, (m) => `Importar ${m[1]}`],
      [/^Remove tag (.*)$/, (m) => `Quitar etiqueta ${m[1]}`],
      [/^Remove (.*)$/, (m) => `Quitar ${m[1]}`],
      [/^Move (.*) (up|down)$/, (m) => `${m[2] === "up" ? "Subir" : "Bajar"} ${m[1]}`],
      [/^(\d+(?:\.\d+)?) out of 5 equivalent$/, (m) => `${m[1]} de 5, equivalente`],
      [/^Add catalog games · (\d+)\/500$/, (m) => `Agregar juegos del catálogo · ${m[1]}/500`],
      [/^Displaying entries (\d+)–(\d+) of (\d+)$/, (m) => `Se muestran los registros ${m[1]}–${m[2]} de ${m[3]}`],
      [/^(\d+) matching profiles$/, (m) => `${m[1]} perfiles coincidentes`],
      [/^(\d+) matches(?: for “(.*)”)?$/, (m) => `${m[1]} coincidencias${m[2] ? ` para “${m[2]}”` : ""}`],
      [/^Tier ([SABCDF])$/, (m) => `Nivel ${m[1]}`],
      [/^(.*) artwork$/, (m) => `Imagen de ${m[1]}`],
      [/^(.*) cover$/, (m) => `Portada de ${m[1]}`],
      [/^(.*) initials$/, (m) => `Iniciales de ${m[1]}`],
      [/^Choose tier, currently (.*)$/, (m) => `Elegí un nivel; actual: ${m[1] === "unassigned" ? "sin asignar" : translations[m[1]] ?? m[1]}`],
      [/^(\d+) IGDB matches\. Check the year, platforms and edition before importing\.$/, (m) => `${m[1]} coincidencias en IGDB. Revisá el año, las plataformas y la edición antes de importar.`],
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
