import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import type { PublicationStatus, Research as ResearchData, SectionText } from "@/content/types";
import { ScrollList } from "@/components/ui/scroll-list";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";

export const publicationStatusLabels: Record<PublicationStatus, string> = {
  published: "Published",
  accepted: "Accepted",
  "under-review": "Under review",
  preprint: "Preprint",
  "in-preparation": "In preparation",
};

export function PublicationStatusBadge({ status }: { status: PublicationStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        status === "published" || status === "accepted" ? "bg-success-soft text-success" : "bg-accent-soft text-accent",
      )}
    >
      {publicationStatusLabels[status]}
    </span>
  );
}

export function Research({ research, authorName, text }: { research: ResearchData; authorName: string; text: SectionText }) {
  return (
    <Section id="research" text={text}>
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <Reveal>
          <blockquote className="space-y-5 border-l-2 border-accent pl-6 text-xl leading-relaxed text-pretty sm:text-2xl sm:leading-relaxed">
            {research.statement.map((paragraph, index) => (
              <p key={paragraph.slice(0, 24)} className={index === 0 ? "font-medium" : "text-muted"}>
                {paragraph}
              </p>
            ))}
          </blockquote>
        </Reveal>

        <div className="space-y-10">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-muted">Areas of interest</h3>
            {/* Three on show; more scroll inside the box. */}
            <ScrollList visible={3} className="grid gap-3" fadeClassName="from-bg via-bg/85">
              {research.interests.map((interest, index) => (
                <Reveal
                  key={interest.title}
                  delay={index * 0.05}
                  className="rounded-2xl border border-line bg-surface p-5"
                >
                  <h4 className="font-semibold">{interest.title}</h4>
                  <p className="mt-1 text-sm text-muted">{interest.description}</p>
                </Reveal>
              ))}
            </ScrollList>
          </div>

          {/* Publications: filled from the admin dashboard as papers come out. */}
          <Reveal>
            <h3 className="mb-4 text-sm font-semibold text-muted">Publications</h3>
            {research.publications.length ? (
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {research.publications.map((pub) => (
                  <li key={pub.slug}>
                    <Link
                      href={`/research/${pub.slug}`}
                      className="group flex gap-4 px-5 py-4 transition-colors hover:bg-surface-2"
                    >
                      <FileText className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span>{pub.year}</span>
                          <PublicationStatusBadge status={pub.status} />
                        </div>
                        <p className="mt-1.5 font-semibold leading-snug group-hover:text-accent">{pub.title}</p>
                        <p className="mt-1 text-sm text-muted">
                          {pub.authors.map((author, index) => (
                            <span key={author}>
                              {index ? ", " : ""}
                              <span className={author === authorName ? "font-semibold text-fg" : undefined}>
                                {author}
                              </span>
                            </span>
                          ))}
                        </p>
                        <p className="text-sm italic text-muted">{pub.venue}</p>
                      </div>
                      <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted group-hover:text-accent" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-line p-5">
                <FileText className="size-5 shrink-0 text-subtle" strokeWidth={1.75} />
                <p className="text-sm text-muted">
                  No publications yet — papers will be listed here as they&apos;re published.
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
