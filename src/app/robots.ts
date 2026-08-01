import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/blog/"], disallow: ["/api/", "/admin/", "/auth/", "/home/", "/profile/", "/resumes/", "/settings/", "/subscription/"] }],
    sitemap: siteUrl("sitemap.xml"),
    host: siteUrl(),
  };
}
