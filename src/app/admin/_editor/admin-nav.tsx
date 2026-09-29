"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  Camera,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/cn";
import type { StoreMode } from "@/lib/store";
import { PublishButton } from "./publish-button";

const groups = [
  { title: "", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "You",
    items: [
      { href: "/admin/profile", label: "Profile", icon: UserRound },
      { href: "/admin/skills", label: "Skills", icon: Sparkles },
    ],
  },
  {
    title: "Journey",
    items: [
      { href: "/admin/education", label: "Education", icon: GraduationCap },
      { href: "/admin/experience", label: "Experience", icon: Briefcase },
      { href: "/admin/honours", label: "Honours & events", icon: Award },
    ],
  },
  {
    title: "Work",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/research", label: "Research", icon: BookOpen },
      { href: "/admin/publications", label: "Publications", icon: FileText },
    ],
  },
  {
    title: "Life",
    items: [{ href: "/admin/canvas", label: "Canvas & Instagram", icon: Camera }],
  },
  { title: "Site", items: [{ href: "/admin/settings", label: "Settings", icon: Settings }] },
];

export function AdminNav({ name, email, mode }: { name: string; email: string | null; mode: StoreMode }) {
  // Only a local dev server needs a Publish step; on the live site every save is a commit.
  const showPublish = mode === "local";
  const pathname = usePathname();
  const links = groups.flatMap((group) => group.items);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-surface/70 backdrop-blur-xl lg:flex">
        <div className="flex items-center justify-between px-5 pb-2 pt-6">
          <Link href="/admin" className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">{name}</span>
            <span className="block text-xs text-muted">Portfolio admin</span>
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {groups.map((group) => (
            <div key={group.title} className="mb-4">
              {group.title ? (
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">{group.title}</p>
              ) : null}
              <ul className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition-colors",
                          active ? "bg-accent-soft font-medium text-accent" : "text-fg/80 hover:bg-surface-2 hover:text-fg",
                        )}
                      >
                        <Icon className="size-[18px]" strokeWidth={1.75} />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="space-y-2 border-t border-line p-4">
          {showPublish ? <PublishButton /> : null}
          <a
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1 rounded-full py-2 text-sm text-muted hover:text-fg"
          >
            View site <ArrowUpRight className="size-4" />
          </a>
          {email ? (
            <form action="/api/auth/logout" method="post" className="flex items-center gap-2 rounded-xl bg-surface-2 py-1.5 pl-3 pr-1.5">
              <span className="min-w-0 flex-1 truncate text-xs text-muted" title={email}>
                {email}
              </span>
              <button type="submit" title="Sign out" aria-label="Sign out" className="grid size-7 place-items-center rounded-full text-muted hover:bg-surface hover:text-fg">
                <LogOut className="size-3.5" />
              </button>
            </form>
          ) : null}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/80 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <Link href="/admin" className="font-semibold tracking-tight">
            {name} <span className="font-normal text-muted">· admin</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {showPublish ? <PublishButton compact /> : null}
            {email ? (
              <form action="/api/auth/logout" method="post">
                <button type="submit" aria-label="Sign out" className="grid size-9 place-items-center rounded-full text-muted hover:text-fg">
                  <LogOut className="size-4" />
                </button>
              </form>
            ) : null}
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-2.5 [scrollbar-width:none]">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm",
                pathname === href ? "bg-accent-soft font-medium text-accent" : "text-muted",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
