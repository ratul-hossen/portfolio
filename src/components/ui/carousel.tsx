"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Apple-style horizontal shelf: native scroll with snap points, plus
 * previous/next buttons on larger screens. Children are the slides.
 */
export function Carousel({
  children,
  label,
  heading,
  itemClassName = "w-[85%] sm:w-[420px]",
  bleed = true,
}: {
  children: React.ReactNode;
  label: string;
  /** Shown on the left of the arrow buttons. */
  heading?: React.ReactNode;
  itemClassName?: string;
  /** Let the shelf run to the right edge of the screen. Off = stays inside the content column. */
  bleed?: boolean;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scroll = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>{heading}</div>
        <div className={cn("hidden gap-2 sm:flex", edges.start && edges.end && "sm:hidden")}>
          <ArrowButton label="Previous" disabled={edges.start} onClick={() => scroll(-1)}>
            <ChevronLeft className="size-5" strokeWidth={1.75} />
          </ArrowButton>
          <ArrowButton label="Next" disabled={edges.end} onClick={() => scroll(1)}>
            <ChevronRight className="size-5" strokeWidth={1.75} />
          </ArrowButton>
        </div>
      </div>
      <ul
        ref={track}
        onScroll={update}
        aria-label={label}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          bleed && "-ml-5 mr-[calc(50%-50vw)] scroll-px-5 pl-5 pr-5 sm:-ml-8 sm:scroll-px-8 sm:pl-8 sm:pr-8",
        )}
      >
        {Children.map(children, (child) => (
          <li className={cn("shrink-0 snap-start", itemClassName)}>{child}</li>
        ))}
      </ul>
    </div>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-full bg-surface-2 text-fg transition-all hover:bg-line disabled:opacity-35 disabled:hover:bg-surface-2"
    >
      {children}
    </button>
  );
}
