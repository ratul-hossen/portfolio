"use client";

import { CloudUpload, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { publish, type ActionResult } from "../actions";

/** Commits and pushes the saved content; Vercel redeploys the site from the push. */
export function PublishButton({ compact }: { compact?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Publish your saved changes to the live site?")) return;
          startTransition(async () => {
            const res = await publish();
            setResult(res);
            window.setTimeout(() => setResult(null), 8000);
          });
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full bg-fg font-medium text-bg transition hover:opacity-90 disabled:opacity-60",
          compact ? "px-3.5 py-1.5 text-sm" : "w-full py-2.5 text-sm",
        )}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CloudUpload className="size-4" />}
        {pending ? "Publishing…" : "Publish"}
      </button>
      {result ? (
        <p
          role="status"
          className={cn(
            "absolute z-40 w-64 rounded-xl border border-line bg-surface p-3 text-xs shadow-xl",
            compact ? "right-0 top-full mt-2" : "bottom-full left-0 mb-2",
            result.ok ? "text-fg" : "text-red-500",
          )}
        >
          {result.ok ? result.message : result.error}
        </p>
      ) : null}
    </div>
  );
}
