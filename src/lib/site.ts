// The one public address of the site, used for links, sitemap and social
// previews. Set NEXT_PUBLIC_SITE_URL in Vercel once you have your own domain.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
