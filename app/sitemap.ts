import type { MetadataRoute } from "next";
import { blogs } from "@/data/blog";

const SITE_URL = "https://flutterflirt.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/our-product`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/bizbox`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/our-story`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  let allSlugs = blogs.map((b) => b.slug);

  try {
    const res = await fetch(`${API_URL}/api/blogs`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const dbBlogs = data.data || data.blogs || [];
      if (Array.isArray(dbBlogs) && dbBlogs.length > 0) {
        allSlugs = Array.from(new Set([...allSlugs, ...dbBlogs.map((b: any) => b.slug)]));
      }
    }
  } catch {
    // Fallback to static blogs
  }

  return [
    ...routes,
    ...allSlugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}