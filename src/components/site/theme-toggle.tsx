"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      aria-label="Toggle colour theme"
    >
      {/* Both icons render on the server; CSS picks one so there's no flash. */}
      <Sun className="hidden size-[18px] dark:block" strokeWidth={1.75} />
      <Moon className="block size-[18px] dark:hidden" strokeWidth={1.75} />
    </button>
  );
}
