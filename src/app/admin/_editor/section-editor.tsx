"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Check, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { saveSection } from "../actions";
import type { SectionId } from "../_lib/sections";
import { CollagePreview } from "./collage-preview";
import { FieldInput } from "./fields";
import { schemas } from "./schema";

export function SectionEditor({ id, initial, canEdit }: { id: SectionId; initial: any; canEdit: boolean }) {
  const schema = schemas[id];
  const [saved, setSaved] = useState(initial);
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);

  const save = () =>
    startTransition(async () => {
      const result = await saveSection(id, value);
      if (result.ok) {
        setSaved(value);
        setStatus({ ok: true, text: result.message ?? "Saved." });
      } else {
        setStatus({ ok: false, text: result.error });
      }
    });

  // ⌘S / Ctrl+S saves; leaving with unsaved changes asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirty && canEdit && !pending) save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  });

  return (
    <div className="pb-32">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{schema.title}</h1>
        <p className="mt-1.5 text-muted">{schema.description}</p>
      </header>

      {schema.collage && Array.isArray(value) ? (
        <CollagePreview
          items={value}
          onChange={(next) => {
            setValue(next);
            setStatus(null);
          }}
          autoSizes={schema.collage.autoSizes}
          labelOf={schema.collage.labelOf}
          closingCard={schema.collage.closingCard}
        />
      ) : null}

      <FieldInput field={schema.root} value={value} onChange={(next) => {
        setValue(next);
        setStatus(null);
      }} />

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 transition-all duration-300 lg:pl-64",
          dirty || status ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <div className="flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-line bg-surface/90 py-2.5 pl-5 pr-2.5 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.45)] backdrop-blur-xl">
          <p className={cn("min-w-0 flex-1 truncate text-sm", status && !status.ok ? "text-red-500" : "text-muted")}>
            {dirty ? (
              "You have unsaved changes"
            ) : status ? (
              <span className="inline-flex items-center gap-1.5">
                {status.ok ? <Check className="size-4 text-success" /> : null}
                {status.text}
              </span>
            ) : null}
          </p>
          {dirty ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setValue(saved);
                  setStatus(null);
                }}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={pending || !canEdit}
                onClick={save}
                title={canEdit ? "Save (⌘S)" : "Saving on the live site needs the database (see the README)"}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
