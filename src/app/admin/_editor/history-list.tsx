"use client";

import { History, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { restore } from "../actions";

/** Earlier saved versions of the whole site, each one click from being live again. */
export function HistoryList({ versions }: { versions: { id: number; saved_at: string; saved_by: string | null }[] }) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!versions.length) {
    return <p className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">No earlier versions yet — they appear here after you save.</p>;
  }

  return (
    <div className="space-y-2">
      <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {versions.map((version) => (
          <li key={version.id} className="flex items-center gap-3 px-4 py-3">
            <History className="size-4 shrink-0 text-muted" />
            <span className="min-w-0 flex-1 text-sm">
              <span className="block tabular-nums">
                {new Date(version.saved_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
              </span>
              {version.saved_by ? <span className="block truncate text-xs text-muted">{version.saved_by}</span> : null}
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!window.confirm("Bring back this version? The current site is kept in history too.")) return;
                setBusyId(version.id);
                startTransition(async () => {
                  const result = await restore(version.id);
                  setMessage(result.ok ? (result.message ?? "Restored.") : result.error);
                  setBusyId(null);
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium transition hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {busyId === version.id ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Restore
            </button>
          </li>
        ))}
      </ol>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
