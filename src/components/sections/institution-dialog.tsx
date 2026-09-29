"use client";

import { ArrowUpRight, FileText, GraduationCap, Link2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { JourneyItem } from "@/content/types";
import { MediaRotator } from "@/components/ui/media-rotator";
import { StatusBadge } from "@/components/ui/tag";
import { TermChart } from "@/components/ui/term-chart";

/**
 * A button that opens a details sheet for an education entry: photo, dates,
 * grades, highlights and courses (with links to their syllabus PDFs).
 */
export function InstitutionSheet({
  item,
  items,
  children,
  className,
  label,
}: {
  item?: JourneyItem;
  /** Several entries merged into one tile: shown side by side (tabs on phones). */
  items?: JourneyItem[];
  children: React.ReactNode;
  className?: string;
  /** Accessible name when the trigger's text isn't descriptive enough. */
  label?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  // Triggers can sit inside a <p>, where a <dialog> isn't allowed, so the
  // sheet is only created on click and portalled to <body>.
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const list = items ?? (item ? [item] : []);

  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    // Keep the page behind the sheet still while it's open.
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" aria-label={label} onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open
        ? createPortal(
            <dialog
              ref={dialog}
              onClose={() => setOpen(false)}
              onClick={(event) => {
                // Clicking the backdrop (the dialog element itself) closes it.
                if (event.target === event.currentTarget) event.currentTarget.close();
              }}
              className={`fixed inset-0 m-auto h-fit max-h-[90dvh] ${list.length > 1 ? "w-[min(94vw,1120px)]" : "w-[min(92vw,640px)]"} overflow-hidden rounded-[2rem] border border-line bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm`}
            >
              <form method="dialog" className="absolute right-4 top-4 z-10">
                <button
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/45"
                >
                  <X className="size-4" />
                </button>
              </form>

              <div className="max-h-[90dvh] overflow-y-auto">
                {list.length > 1 ? (
                  // Phones: tabs. Wider screens: the entries side by side.
                  <div className="sticky top-0 z-10 flex gap-1 border-b border-line bg-surface/95 p-2 pr-16 backdrop-blur md:hidden">
                    {list.map((entry, i) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setTab(i)}
                        aria-pressed={tab === i}
                        className={
                          tab === i
                            ? "min-w-0 flex-1 truncate rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white"
                            : "min-w-0 flex-1 truncate rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface-2"
                        }
                      >
                        {entry.organization}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className={list.length > 1 ? "md:grid md:grid-cols-2 md:divide-x md:divide-line" : undefined}>
                  {list.map((entry, i) => (
                    <div key={entry.id} className={list.length > 1 && tab !== i ? "max-md:hidden" : undefined}>
                      <InstitutionDetails item={entry} />
                    </div>
                  ))}
                </div>
              </div>
            </dialog>,
            document.body,
          )
        : null}
    </>
  );
}

/** One entry's details: banner, grades, highlights, courses and documents. */
function InstitutionDetails({ item }: { item: JourneyItem }) {
  return (
    <>
    {/* Banner: institution, place and dates, with the photo (or an icon) on the right. */}
    <div className="relative flex h-52 items-end overflow-hidden bg-gradient-to-br from-[#0a2a5c] via-[#0b4a9e] to-[#2997ff] p-7 text-white sm:h-60 sm:p-8">
      {item.media?.length ? (
        <div className="absolute inset-y-0 right-0 w-1/2 sm:w-[45%]">
          <MediaRotator
            items={item.media}
            alt={item.organization}
            sizes="300px"
            fallbackStyle="cutout"
            className="size-full"
          />
        </div>
      ) : (
        <GraduationCap
          aria-hidden
          className="absolute -right-4 -top-2 size-48 text-white/10"
          strokeWidth={1}
        />
      )}
      <div className="relative max-w-[60%] sm:max-w-[55%]">
        <p className="text-sm text-white/70">
          {item.start} — {item.end ?? "Present"}
        </p>
        <h3 className="mt-1.5 text-2xl font-semibold leading-tight tracking-tight">{item.organization}</h3>
        {item.location ? <p className="mt-1 text-sm text-white/75">{item.location}</p> : null}
      </div>
    </div>

    <div className="space-y-6 p-7 sm:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h4 className="text-lg font-semibold leading-snug">{item.title}</h4>
        {item.status === "in-progress" ? <StatusBadge status="in-progress" /> : null}
      </div>

      {item.grade ? (
        <div className="flex flex-col gap-5 rounded-2xl bg-surface-2 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="shrink-0">
            <p className="text-4xl font-semibold tracking-tight">{item.grade.split(" ")[0]}</p>
            <p className="mt-0.5 text-sm text-muted">{item.grade.split(" ").slice(1).join(" ")}</p>
          </div>
          {item.grades?.length ? <TermChart grades={item.grades} compact className="sm:w-1/2" /> : null}
        </div>
      ) : null}

      {item.summary ? <p className="leading-relaxed text-muted">{item.summary}</p> : null}

      {item.highlights?.length ? (
        <ul className="space-y-2.5 text-[15px] leading-relaxed text-muted">
          {item.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-3">
              <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-accent" />
              {highlight}
            </li>
          ))}
        </ul>
      ) : null}

      {item.courses?.length ? (
        <div>
          <h4 className="text-sm font-semibold text-muted">Courses</h4>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {item.courses.map((course) => {
              const body = (
                <>
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <FileText className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug">{course.name}</span>
                    <span className="block text-xs text-muted">
                      {course.code}
                      {course.url ? " · Course structure (PDF)" : ""}
                    </span>
                  </span>
                  {course.url ? <ArrowUpRight className="size-4 shrink-0 text-muted" /> : null}
                </>
              );
              return (
                <li key={course.code}>
                  {course.url ? (
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {item.links?.length ? (
        <div>
          <h4 className="text-sm font-semibold text-muted">Documents</h4>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {item.links.map((doc) => {
              const pdf = /\.pdf($|\?)/i.test(doc.url);
              return (
                <li key={doc.url}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                      {pdf ? <FileText className="size-4" strokeWidth={1.75} /> : <Link2 className="size-4" strokeWidth={1.75} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium leading-snug">{doc.label}</span>
                      <span className="block text-xs text-muted">{pdf ? "PDF" : "Link"}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
    </>
  );
}

/** Inline institution name (used inside running text) that opens its sheet. */
export function InstitutionLink({ item, children }: { item: JourneyItem; children: React.ReactNode }) {
  return (
    <InstitutionSheet
      item={item}
      className="font-medium text-fg underline decoration-accent/40 decoration-2 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
    >
      {children}
    </InstitutionSheet>
  );
}
