"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./theme-toggle";

export function Navbar({ name, items: navItems }: { name: string; items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-line bg-nav backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="text-[15px] font-semibold tracking-tight" onClick={() => setOpen(false)}>
          {name}
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-[13px] text-muted transition-colors hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full text-fg"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" strokeWidth={1.75} /> : <Menu className="size-5" strokeWidth={1.75} />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-line px-5 pb-6 pt-2 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line py-3.5 text-lg font-medium last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
