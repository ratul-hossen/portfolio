"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SocialIcon } from "@/components/ui/social-icon";

/** WhatsApp icon that reveals the username with a copy button. */
export function WhatsAppButton({ handle, className }: { handle: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(handle);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the handle is still visible to copy by hand.
    }
  };

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label="WhatsApp"
        aria-expanded={open}
        title="WhatsApp"
        onClick={() => setOpen((v) => !v)}
        className={className}
      >
        <SocialIcon platform="whatsapp" />
      </button>
      {open ? (
        <div className="absolute bottom-full right-0 z-10 mb-2 flex items-center gap-3 whitespace-nowrap rounded-2xl border border-line bg-surface px-4 py-3 shadow-lg">
          <div>
            <p className="text-xs text-muted">WhatsApp</p>
            <p className="font-medium text-fg">{handle}</p>
          </div>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy WhatsApp username"
            className="grid size-8 place-items-center rounded-full bg-surface-2 text-muted hover:text-fg"
          >
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          </button>
        </div>
      ) : null}
    </div>
  );
}
