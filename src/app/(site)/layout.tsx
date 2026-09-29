import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { getProfile, getSettings } from "@/lib/content";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);
  const navItems = Object.entries(settings.sections)
    .filter(([, section]) => section.show && section.navLabel)
    .map(([id, section]) => ({ href: `/#${id}`, label: section.navLabel! }));

  return (
    <>
      <Navbar name={profile.shortName} items={navItems} />
      <main className="overflow-x-clip">{children}</main>
      <Footer profile={profile} />
    </>
  );
}
