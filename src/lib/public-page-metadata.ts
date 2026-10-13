import "server-only";
import { getPublicPortfolioShell } from "@/lib/public-portfolio";
import { getMessages } from "@/lib/locale/server";
import { siteUrl, noIndex } from "@/lib/site-url";
export async function publicPageMetadata(handle:string,suffix:string,label:string) {
 const [portfolio,t]=await Promise.all([getPublicPortfolioShell(handle),getMessages()]);
 if(!portfolio) return {title:t("Profile unavailable"),robots:noIndex,openGraph:{title:t("Profile unavailable")}};
 const title=`${t(label)} · ${portfolio.profile.displayName}`;
 const url=siteUrl(`${portfolio.publicBase}${suffix}`);
 const description=t("Public game ratings, tiers and reviews.");
 return {title,description,robots:noIndex,alternates:{canonical:url},openGraph:{title,description,url},twitter:{card:"summary" as const,title,description}};
}
