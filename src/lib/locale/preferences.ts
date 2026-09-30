export type SiteLocale = "en" | "es-AR";
export type SiteTheme = "dark" | "light";
export const localeCookie = "playlogg_locale";
export const themeCookie = "playlogg_theme";
export const siteLocale = (value: string | undefined): SiteLocale => value === "es-AR" ? "es-AR" : "en";
export const siteTheme = (value: string | undefined): SiteTheme => value === "light" ? "light" : "dark";
