"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MediaItem, MediaStyle } from "@/content/types";
import { cn } from "@/lib/cn";
import { SiteVideo } from "./autoplay-video";

const fitClass: Record<MediaStyle, string> = {
  photo: "object-cover",
  document: "object-contain p-4",
  cutout: "object-contain object-bottom pt-6",
};

/**
 * Shows one photo or video, or cross-fades through several on a timer.
 * Rotation pauses while hovered, while off screen, and for people who
 * prefer reduced motion. A video slide stays up longer and only plays
 * while it is the one showing.
 */
export function MediaRotator({
  items: all,
  alt,
  sizes,
  className,
  fallbackStyle = "photo",
  priority,
  interval = 4500,
  controls = true,
}: {
  items: MediaItem[];
  /** Used when an item has no alt text or caption of its own. */
  alt: string;
  sizes: string;
  className?: string;
  fallbackStyle?: MediaStyle;
  priority?: boolean;
  interval?: number;
  /** Clickable dots; turn off inside links, where buttons aren't allowed. */
  controls?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  // Only photos and videos can be shown here (a stray PDF would break the image).
  const items = all.filter((item) => !/\.pdf($|\?)/i.test(item.url));
  const count = items.length;
  const active = count ? index % count : 0;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const current = items[active];
  useEffect(() => {
    if (count < 2 || hovered || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wait = current?.type === "video" ? interval * 3 : interval;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), wait);
    return () => window.clearTimeout(timer);
  }, [active, count, hovered, visible, interval, current?.type]);

  if (!count) return null;

  return (
    <div
      ref={root}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {items.map((item, i) => {
        const shown = i === active;
        const label = item.alt || item.caption || alt;
        return (
          <div
            key={`${item.url}-${i}`}
            aria-hidden={!shown}
            className={cn(
              "absolute inset-0 transition-[opacity,transform] duration-1000 ease-out",
              shown ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
            )}
          >
            {item.type === "video" ? (
              // Only the showing video is mounted, so hidden ones never play.
              shown ? <SiteVideo url={item.url} title={label} className="size-full object-cover" /> : null
            ) : (
              <Image
                src={item.url}
                alt={shown ? label : ""}
                fill
                sizes={sizes}
                priority={priority && i === 0}
                className={cn("transition-transform duration-500", fitClass[item.style ?? fallbackStyle])}
              />
            )}
          </div>
        );
      })}

      {count > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2 py-1.5 backdrop-blur-sm">
          {items.map((item, i) =>
            controls ? (
              <button
                key={`${item.url}-${i}`}
                type="button"
                aria-label={`Show ${i + 1} of ${count}`}
                aria-current={i === active}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full bg-white shadow transition-all",
                  i === active ? "w-5 opacity-100" : "w-1.5 opacity-60 hover:opacity-90",
                )}
              />
            ) : (
              <span
                key={`${item.url}-${i}`}
                aria-hidden
                className={cn("h-1.5 rounded-full bg-white shadow transition-all", i === active ? "w-5" : "w-1.5 opacity-60")}
              />
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
