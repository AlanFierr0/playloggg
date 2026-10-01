import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
export default function robots(): MetadataRoute.Robots {
  // Allow crawling so page-level noindex can be seen. This is not access control.
  return { rules: { userAgent: "*", allow: "/", disallow: "/auth/" }, sitemap: siteUrl("/sitemap.xml") };
}
