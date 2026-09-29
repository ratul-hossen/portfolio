"use client";

import { Children, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A list that shows its first `visible` items and scrolls the rest inside
 * itself. Scrolling over it never scrolls the page (overscroll-contain).
 * With `visible` items or fewer it's an ordinary list.
 */
export function ScrollList({
  visible,
  as: Tag = "div",
  className,
  fadeClassName = "from-surface via-surface/85",
  clip,
  children,
}: {
  visible: number;
  as?: "div" | "ol" | "ul";
  className?: string;
  /** Gradient colours of the "more below" fade, to match the background. */
  fadeClassName?: string;
  /** Clip to the rounded corners even when not scrolling. */
  clip?: boolean;
  children: React.ReactNode;
}) {
  const list = useRef<HTMLElement>(null);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [atEnd, setAtEnd] = useState(false);
  const count = Children.count(children);
  const scrollable = count > visible;

  useEffect(() => {
    const el = list.current;
    if (!el || !scrollable) return;
    const measure = () => {
      const last = el.children[visible - 1] as HTMLElement | undefined;
      if (last) setMaxHeight(last.offsetTop + last.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollable, visible, count]);

  return (
    <div className="relative">
      <Tag
        // The union of element refs is wider than any one tag's ref type.
        ref={list as React.Ref<never>}
        style={scrollable && maxHeight ? { maxHeight } : undefined}
        onScroll={(e: React.UIEvent<HTMLElement>) => {
          const el = e.currentTarget;
          setAtEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
        }}
        className={cn(
          "relative",
          scrollable ? "overflow-y-auto overscroll-contain [scrollbar-width:thin]" : clip && "overflow-hidden",
          className,
        )}
      >
        {children}
      </Tag>
      {scrollable ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-px bottom-px flex h-20 items-end justify-center rounded-b-3xl bg-gradient-to-t to-transparent pb-3 transition-opacity duration-300",
            fadeClassName,
            atEnd && "opacity-0",
          )}
        >
          <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted shadow-sm">
            Scroll for {count - visible} more
          </span>
        </div>
      ) : null}
    </div>
  );
}
