import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/blog", "/privacy", "/terms", "/refund", "/security"].map((path) => ({
    url: siteUrl(path),
    lastModified: new Date(),
  }));

  const blogPages = getAllPosts().map((post) => ({
    url: siteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.frontMatter.date),
  }));

  return [...staticPages, ...blogPages];
}
