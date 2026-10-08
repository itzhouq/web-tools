import type { MetadataRoute } from "next";
import { TOOLS } from "@/lib/tools";
import { site } from "@/lib/site";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base64 = base ? `${site.mainSiteUrl}${base}` : site.siteUrl;
  return [
    {
      url: base64,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...TOOLS.map((t) => ({
      url: `${base64}/tools/${t.slug}/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
