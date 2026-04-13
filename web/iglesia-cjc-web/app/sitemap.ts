import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

const routes = [
  "",
  "/contacto",
  "/eventos",
  "/sermones",
  "/pastores",
  "/devocionales",
  "/live",
  "/equipos",
  "/oraciones",
  "/recursos",
  "/biblia",
  "/galeria",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
