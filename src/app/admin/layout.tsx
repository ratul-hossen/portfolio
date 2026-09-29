import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { getProfile } from "@/lib/content";
import { storageMode } from "@/lib/store";
import { AdminNav } from "./_editor/admin-nav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  const profile = await getProfile();

  return (
    <div className="min-h-dvh bg-bg">
      <AdminNav name={profile.shortName} email={admin.email} storage={storageMode} />
      <main className="px-4 py-8 sm:px-8 lg:ml-64 lg:py-12">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
