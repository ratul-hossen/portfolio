"use client";

import { Children, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Several cards sharing one tile: they sit on top of each other and
 * cross-fade in turn. Pauses while hovered or focused, while off screen,
 * and for people who prefer reduced motion. Only the showing card can be
 * clicked or tabbed to.
 */
export function RotatingStack({
  children,
  labels,
  interval = 5000,
  className,
  dotsClassName,
}: {
  children: React.ReactNode;
  /** Names for the dots, e.g. the institution of each card. */
  labels: string[];
  interval?: number;
  className?: string;
  dotsClassName?: string;
}) {
  const cards = Children.toArray(children);
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const count = cards.length;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (count < 2 || paused || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % count), interval);
    return () => window.clearTimeout(timer);
  }, [active, count, paused, visible, interval]);

  if (count < 2) return <>{children}</>;

  return (
    <div
      ref={root}
      className={cn("relative grid h-full", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          aria-hidden={i !== active}
          inert={i !== active}
          className={cn(
            "[grid-area:1/1] transition-opacity duration-700 ease-out",
            i === active ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {card}
        </div>
      ))}
      <div
        className={cn(
          "absolute left-1/2 top-3 z-20 flex -translate-x-1/2 gap-1 rounded-full border border-line bg-surface/90 p-1.5 shadow-sm backdrop-blur-sm",
          dotsClassName,
        )}
      >
        {labels.map((label, i) => (
          <button
            key={label + i}
            type="button"
            aria-label={`Show ${label}`}
            aria-current={i === active}
            title={label}
            onClick={() => setActive(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-5 bg-accent" : "w-1.5 bg-subtle/60 hover:bg-subtle",
            )}
          />
        ))}
      </div>
    </div>
  );
}
