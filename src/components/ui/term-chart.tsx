"use client";

import { useEffect, useRef, useState } from "react";
import type { GradeRecord } from "@/content/types";
import { cn } from "@/lib/cn";

/** "Spring 2025" → "Spr '25", "Fall 2025" → "Fall '25". */
export function shortTerm(term: string) {
  return term.replace(
    /^(\w+)\s+20(\d\d)$/,
    (_, season: string, year: string) => `${season.length > 4 ? season.slice(0, 3) : season} '${year}`,
  );
}

/**
 * Term GPA bars, scaled over 3.0–4.0 so differences are visible. Bars keep
 * a minimum width: when there are more terms than fit, the chart scrolls
 * sideways inside its own space and starts at the latest term.
 */
export function TermChart({
  grades,
  inverted,
  compact,
  className,
}: {
  grades: GradeRecord[];
  /** Light text for the dark education card. */
  inverted?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const floor = 3;
  const barArea = compact ? 56 : 80;

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };

  // Open on the most recent terms.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
    update();
  }, [grades.length]);

  const fade = inverted ? "from-fg" : "from-surface-2";

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        ref={scroller}
        onScroll={update}
        className="overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className={cn("flex items-end", compact ? "gap-2" : "gap-3")}>
          {grades.map((grade) => (
            <div
              key={grade.term}
              className={cn("flex flex-1 shrink-0 flex-col items-center", compact ? "min-w-11 gap-1" : "min-w-12 gap-2")}
            >
              <span className={cn("font-semibold tabular-nums", compact ? "text-[11px]" : "text-xs")}>
                {grade.gpa.toFixed(2)}
              </span>
              <div
                className={cn("w-full bg-accent", compact ? "rounded-md" : "rounded-lg")}
                style={{ height: `${Math.max(compact ? 8 : 10, ((grade.gpa - floor) / (4 - floor)) * barArea)}px` }}
              />
              <span
                className={cn(
                  "w-full truncate border-t pt-2 text-center",
                  compact ? "text-[10px]" : "text-[11px]",
                  inverted ? "border-bg/15 text-bg/60" : "border-line text-muted",
                )}
              >
                {shortTerm(grade.term)}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Soft edges show there's more to scroll to. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r to-transparent transition-opacity",
          fade,
          edges.start ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l to-transparent transition-opacity",
          fade,
          edges.end ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
