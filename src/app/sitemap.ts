import type { MetadataRoute } from "next";
import { getProjects, getResearch, getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, research, settings] = await Promise.all([getProjects(), getResearch(), getSettings()]);
  return [
    { url: siteUrl, priority: 1 },
    ...(settings.showAcademicPage ? [{ url: `${siteUrl}/academic`, priority: 0.9 }] : []),
    ...projects.map((project) => ({ url: `${siteUrl}/projects/${project.slug}`, priority: 0.7 })),
    ...research.publications.map((pub) => ({ url: `${siteUrl}/research/${pub.slug}`, priority: 0.8 })),
  ];
}
