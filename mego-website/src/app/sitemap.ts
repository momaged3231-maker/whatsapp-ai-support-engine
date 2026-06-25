import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mego-gomsa.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/services", "/business", "/printing-ads", "/request"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
