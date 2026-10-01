export const siteOrigin = "https://playloggg.vercel.app";
export const siteUrl = (path: string) => new URL(path, siteOrigin).toString();
export const noIndex = { index: false, follow: false } as const;
