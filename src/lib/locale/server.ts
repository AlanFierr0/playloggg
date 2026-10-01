import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { localeCookie, siteLocale } from "./preferences";
import { translateText } from "./translate";
export const getMessages = cache(async () => {
  const locale = siteLocale((await cookies()).get(localeCookie)?.value);
  return (source: string) => translateText(source, locale);
});

/** Translate only framework metadata fields; catalog/user titles use explicit formats. */
export async function localizeMetadata(metadata: import("next").Metadata): Promise<import("next").Metadata> {
  const t = await getMessages();
  function localized(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(localized);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typeof item === "string" && ["title", "default", "description"].includes(key) ? t(item) : localized(item)]));
    return value;
  }
  return localized(metadata) as import("next").Metadata;
}
