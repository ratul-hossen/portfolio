import type { Metadata, Viewport } from "next";
import { Amiri_Quran, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/site/theme-provider";
import { getProfile } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// For Qur'anic text: full tashkeel and Uthmani marks.
const amiriQuran = Amiri_Quran({
  variable: "--font-amiri-quran",
  subsets: ["arabic"],
  weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const title = `${profile.name} — ${profile.headline}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s · ${profile.name}` },
    description: profile.tagline,
    openGraph: { type: "website", title, description: profile.tagline, siteName: profile.name },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${amiriQuran.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
