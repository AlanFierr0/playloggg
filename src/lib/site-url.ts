export const siteOrigin = "https://playlogg.alanfierro.dev";
export const siteUrl = (path: string) => new URL(path, siteOrigin).toString();
export const noIndex = { index: false, follow: false } as const;
