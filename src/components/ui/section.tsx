import type { SectionText } from "@/content/types";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

export function Section({
  id,
  text: { eyebrow, title, intro },
  children,
  className,
}: {
  id: string;
  /** Heading text, edited under Settings in the admin panel. */
  text: SectionText;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("px-5 py-24 sm:px-8 sm:py-32", className)}>
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12 max-w-3xl sm:mb-16">
          <p className="mb-3 text-sm font-semibold text-accent">{eyebrow}</p>
          <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h2>
          {intro ? <p className="mt-5 text-lg leading-relaxed text-muted text-pretty sm:text-xl">{intro}</p> : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
