"use client";

import { ArrowUpRight, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { JourneyItem } from "@/content/types";
import { MediaRotator } from "@/components/ui/media-rotator";
import { StatusBadge } from "@/components/ui/tag";
import { ScrollList } from "@/components/ui/scroll-list";

function dateRange(item: JourneyItem) {
  if (item.status === "upcoming" || (item.status === "completed" && !item.end)) return item.start;
  return `${item.start} — ${item.end ?? "Present"}`;
}

/** A role opens a details sheet only when there's more to show than its one-line summary. */
function hasDetails(item: JourneyItem) {
  return Boolean(
    item.highlights?.length || item.media?.length || item.quote || item.url || item.links?.length,
  );
}

/**
 * Experience & leadership as a CV: one row per role (dates, role,
 * organisation, one-line summary). Rows with more detail open a sheet.
 * Linking to #<id> opens that role (e.g. the Skills highlight card).
 */
export function ExperienceList({ items }: { items: JourneyItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((item) => item.id === openId) ?? null;

  const openFromHash = useCallback(() => {
    const id = window.location.hash.slice(1);
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (hasDetails(item)) setOpenId(id);
  }, [items]);

  useEffect(() => {
    window.addEventListener("hashchange", openFromHash);
    const timer = window.setTimeout(openFromHash, 0);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.clearTimeout(timer);
    };
  }, [openFromHash]);

  return (
    <>
      {/* Four roles on show; the rest scroll inside the list. */}
      <ScrollList as="ol" visible={4} clip className="divide-y divide-line rounded-3xl border border-line bg-surface">
        {items.map((item) => {
          const clickable = hasDetails(item);
          const row = (
            <>
              <span className="text-sm text-muted tabular-nums sm:pt-0.5">{dateRange(item)}</span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="font-semibold leading-snug tracking-tight">{item.title}</span>
                  {item.status === "completed" || item.status === "upcoming" ? (
                    <StatusBadge status={item.status} />
                  ) : null}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {item.organization}
                  {item.location ? ` · ${item.location}` : ""}
                </span>
                {item.summary ? (
                  <span className="mt-2 block text-[15px] leading-relaxed text-fg/80 sm:line-clamp-2">
                    {item.summary}
                  </span>
                ) : null}
              </span>
              {clickable ? (
                <span className="mt-1 inline-flex items-center gap-0.5 text-sm font-medium text-accent sm:hidden">
                  Details <ChevronRight className="size-4" />
                </span>
              ) : null}
              <span className="hidden items-center justify-end sm:flex">
                {clickable ? (
                  <span className="inline-flex items-center gap-0.5 text-sm font-medium text-accent">
                    Details <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                ) : null}
              </span>
            </>
          );
          const layout = "grid w-full gap-1.5 px-6 py-5 text-left sm:grid-cols-[10rem_1fr_6rem] sm:gap-6 sm:px-8";
          return (
            <li key={item.id} id={item.id} className="scroll-mt-24">
              {clickable ? (
                <button
                  type="button"
                  onClick={() => setOpenId(item.id)}
                  className={`group ${layout} transition-colors hover:bg-surface-2`}
                >
                  {row}
                </button>
              ) : (
                <div className={layout}>{row}</div>
              )}
            </li>
          );
        })}
      </ScrollList>

      {open ? <RoleSheet item={open} onClose={() => setOpenId(null)} /> : null}
    </>
  );
}

function RoleSheet({ item, onClose }: { item: JourneyItem; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
    // Keep the page behind the sheet still while it's open.
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="fixed inset-0 m-auto h-fit max-h-[90dvh] w-[min(92vw,680px)] overflow-hidden rounded-[2rem] border border-line bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <form method="dialog" className="absolute right-4 top-4 z-10">
        <button
          aria-label="Close"
          className="grid size-9 place-items-center rounded-full bg-surface/90 text-muted shadow-sm backdrop-blur hover:text-fg"
        >
          <X className="size-4" />
        </button>
      </form>
      <div className="max-h-[90dvh] overflow-y-auto">
        {item.media?.length ? (
          <MediaRotator
            items={item.media}
            alt={item.title}
            sizes="(min-width: 640px) 680px, 92vw"
            className="aspect-[16/9] bg-surface-2"
          />
        ) : null}
        <div className="p-7 sm:p-9">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pr-10 text-sm text-muted">
            <span className="font-medium text-accent">{item.kind === "experience" ? "Experience" : "Leadership"}</span>
            <span className="tabular-nums">{dateRange(item)}</span>
            {item.status ? <StatusBadge status={item.status} /> : null}
          </div>
          <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl">
            {item.title}
          </h3>
          <p className="mt-1.5 text-muted">
            {item.organization}
            {item.location ? ` · ${item.location}` : ""}
          </p>
          {item.summary ? <p className="mt-5 leading-relaxed text-pretty">{item.summary}</p> : null}
          {item.highlights?.length ? (
            <ul className="mt-5 space-y-3 border-t border-line pt-5 text-[15px] leading-relaxed text-muted">
              {item.highlights.map((highlight) => {
                // "Label — detail" lines get a bold label, like a résumé.
                const [label, ...rest] = highlight.split(" — ");
                return (
                  <li key={highlight} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-accent" />
                    <span>
                      {rest.length ? (
                        <>
                          <span className="font-semibold text-fg">{label}</span> — {rest.join(" — ")}
                        </>
                      ) : (
                        highlight
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {item.quote ? (
            <blockquote className="mt-6 border-l-2 border-accent pl-4 text-[15px] italic text-muted">
              “{item.quote}”
            </blockquote>
          ) : null}
          {item.links?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {item.links.map((link) => {
                const internal = link.url.startsWith("/");
                return (
                  <a
                    key={link.url}
                    href={link.url}
                    target={internal ? undefined : "_blank"}
                    rel={internal ? undefined : "noreferrer"}
                    onClick={internal ? () => dialog.current?.close() : undefined}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
                  >
                    {link.label} <ArrowUpRight className="size-4" />
                  </a>
                );
              })}
            </div>
          ) : null}
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex text-sm font-medium text-accent hover:underline"
            >
              Visit ↗
            </a>
          ) : null}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
