import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/listings"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/help"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const properties = await getProperties();
    propertyRoutes = properties
      .filter((p) => p.isPublished !== false)
      .map((p) => ({
        url: absoluteUrl(`/property/${p.id}`),
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.85,
      }));
  } catch {
    /* empty sitemap section if DB unavailable */
  }

  return [...staticRoutes, ...propertyRoutes];
}
