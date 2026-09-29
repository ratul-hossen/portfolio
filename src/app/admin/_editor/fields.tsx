"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ArrowUp,
  FileText,
  Film,
  ImagePlus,
  Link2,
  Pin,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Field } from "./schema";
import { uploadFile } from "./upload";

type Props<F extends Field = Field> = { field: F; value: any; onChange: (value: any) => void };

const inputClass =
  "w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-[15px] text-fg outline-none transition placeholder:text-subtle focus:border-accent focus:ring-4 focus:ring-accent/15";

export function FieldInput({ field, value, onChange }: Props) {
  switch (field.kind) {
    case "object":
      return <ObjectInput field={field} value={value} onChange={onChange} />;
    case "list":
      return <ListInput field={field} value={value} onChange={onChange} />;
    case "media":
      return <MediaInput field={field} value={value} onChange={onChange} />;
    case "strings":
      return <StringsInput field={field} value={value} onChange={onChange} />;
    default:
      return <Labelled field={field}>{(id) => <ScalarInput id={id} field={field} value={value} onChange={onChange} />}</Labelled>;
  }
}

function Labelled({ field, children }: { field: Field; children: (id: string) => React.ReactNode }) {
  const id = useId();
  if (field.kind === "boolean") return <>{children(id)}</>;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {field.label}
      </label>
      {children(id)}
      {field.help ? <p className="text-xs text-muted">{field.help}</p> : null}
    </div>
  );
}

function ScalarInput({ id, field, value, onChange }: Props & { id: string }) {
  switch (field.kind) {
    case "textarea":
      return (
        <textarea
          id={id}
          value={value ?? ""}
          rows={field.rows ?? 3}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass, "field-sizing-content min-h-20 resize-y leading-relaxed")}
        />
      );
    case "number":
      return <NumberInput id={id} step={field.step} value={value} onChange={onChange} />;
    case "boolean":
      return (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-bg px-4 py-3">
          <span className="text-[15px] font-medium">{field.label}</span>
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-6 w-10 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-success peer-focus-visible:ring-4 peer-focus-visible:ring-accent/25 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
          />
        </label>
      );
    case "select":
      return (
        <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "pr-8")}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "file":
      return <FileInput id={id} accept={field.accept} value={value} onChange={onChange} />;
    case "text":
      return (
        <input
          id={id}
          type="text"
          value={value ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
    default:
      return null;
  }
}

/** Keeps the typed text so “3.” doesn't collapse to “3” mid-typing. */
function NumberInput({ id, step, value, onChange }: { id: string; step?: number; value: any; onChange: (v: any) => void }) {
  const [text, setText] = useState(value === undefined || value === null ? "" : String(value));
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    if (Number(text) !== value) setText(value === undefined || value === null ? "" : String(value));
  }
  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      data-step={step}
      value={text}
      onChange={(e) => {
        const next = e.target.value.replace(",", ".");
        setText(next);
        const parsed = Number(next);
        onChange(next.trim() === "" ? undefined : Number.isNaN(parsed) ? value : parsed);
      }}
      className={cn(inputClass, "tabular-nums")}
    />
  );
}

function FileInput({ id, accept, value, onChange }: { id: string; accept: string; value: any; onChange: (v: any) => void }) {
  const picker = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url: string = value ?? "";
  const isImage = /\.(webp|png|jpe?g|gif|avif|svg)$/i.test(url);
  const isVideo = /\.(mp4|webm|mov)$/i.test(url) || /youtu\.?be/.test(url);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="grid size-[4.5rem] shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2">
        {url && isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="size-full object-cover" />
        ) : url && isVideo ? (
          <Film className="size-6 text-muted" strokeWidth={1.5} />
        ) : url ? (
          <FileText className="size-6 text-muted" strokeWidth={1.5} />
        ) : (
          <Upload className="size-5 text-subtle" strokeWidth={1.5} />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input
          id={id}
          type="text"
          value={url}
          placeholder="Upload a file or paste a link"
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass, "py-2 text-sm")}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => picker.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium transition hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {busy ? "Uploading…" : url ? "Replace" : "Upload"}
          </button>
          {url ? (
            <button type="button" onClick={() => onChange("")} className="text-xs text-muted hover:text-red-500">
              Remove
            </button>
          ) : null}
          {error ? <span className="text-xs text-red-500">{error}</span> : null}
        </div>
        <input
          ref={picker}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function ObjectInput({ field, value, onChange }: Props<Extract<Field, { kind: "object" }>>) {
  const body = (
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {field.fields.map((sub) => (
        <div key={sub.key} className={sub.half ? undefined : "sm:col-span-2"}>
          <FieldInput field={sub} value={value?.[sub.key]} onChange={(v) => onChange({ ...value, [sub.key]: v })} />
        </div>
      ))}
    </div>
  );

  if (!field.label) return body;

  if (field.optional && !value) {
    return (
      <div className="space-y-1.5">
        <p className="text-sm font-medium">{field.label}</p>
        <AddButton onClick={() => onChange(field.optional!.newValue())}>{field.optional.addLabel}</AddButton>
      </div>
    );
  }

  return (
    <fieldset className="space-y-4 rounded-2xl border border-line p-4">
      <legend className="flex w-full items-center justify-between px-1 text-sm font-medium">
        {field.label}
      </legend>
      {body}
      {field.optional ? (
        <button type="button" onClick={() => onChange(undefined)} className="text-xs text-muted hover:text-red-500">
          Remove {field.label.toLowerCase()}
        </button>
      ) : null}
    </fieldset>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-3.5 py-2 text-sm font-medium text-accent transition hover:border-accent hover:bg-accent-soft"
    >
      <Plus className="size-4" /> {children}
    </button>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-30",
        danger ? "hover:text-red-500" : "hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function PinButton({ pinned, label, full, max, onToggle }: { pinned: boolean; label: string; full: boolean; max: number; onToggle: () => void }) {
  const blocked = !pinned && full;
  return (
    <button
      type="button"
      aria-pressed={pinned}
      aria-label={pinned ? `Remove from ${label.toLowerCase()}` : `Mark as ${label.toLowerCase()}`}
      title={blocked ? `Only ${max} allowed — unpin another first` : pinned ? `Remove from ${label.toLowerCase()}` : `Mark as ${label.toLowerCase()}`}
      disabled={blocked}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "grid size-8 place-items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-30",
        pinned ? "bg-accent text-white hover:brightness-110" : "text-muted hover:bg-surface-2 hover:text-accent",
      )}
    >
      <Pin className={cn("size-4", pinned && "fill-current")} />
    </button>
  );
}

function move<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

let counter = 0;
const newKey = () => `k${++counter}`;

/** Stable React keys for a list whose items have no ids of their own. */
function useKeys(length: number) {
  const [keys, setKeys] = useState(() => Array.from({ length }, newKey));
  if (keys.length !== length) {
    const fixed = keys.slice(0, length);
    while (fixed.length < length) fixed.push(newKey());
    setKeys(fixed);
  }
  return [keys, setKeys] as const;
}

function ListInput({ field, value, onChange }: Props<Extract<Field, { kind: "list" }>>) {
  const items: any[] = Array.isArray(value) ? value : [];
  const [keys, setKeys] = useKeys(items.length);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const footer = field.footer?.(items);
  const pin = field.pin;
  const pinnedCount = pin ? items.filter((it) => it?.[pin.key]).length : 0;

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const reorder = (from: number, to: number) => {
    setKeys(move(keys, from, to));
    onChange(move(items, from, to));
  };

  // Pinned items always sit at the top, as they do on the site. Pinning moves
  // an item to the end of the pinned group; unpinning, to the top of the rest.
  const isPinned = (it: any) => Boolean(pin && it?.[pin.key]);
  const togglePin = (index: number) => {
    const target = pinnedCount;
    const flipped = items.map((it, i) => (i === index ? { ...it, [pin!.key]: !it?.[pin!.key] } : it));
    const to = isPinned(items[index]) ? target - 1 : target;
    setKeys(move(keys, index, to));
    onChange(move(flipped, index, to));
  };
  // Arrows move within a group; a pinned item can't drop below an unpinned one.
  const canMove = (index: number, by: number) => {
    const to = index + by;
    if (to < 0 || to >= items.length) return false;
    return !pin || isPinned(items[index]) === isPinned(items[to]);
  };

  const list = (
    <div className="space-y-3">
      {pin ? (
        <div className="flex items-start gap-3 rounded-2xl bg-accent-soft/60 px-4 py-3">
          <Pin className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="text-sm">
            <span className="font-semibold tabular-nums">
              {pinnedCount} of {pin.max} {pin.label.toLowerCase()}
            </span>
            <span className="text-muted"> — {pin.note} Use the pin button on each row.</span>
          </p>
        </div>
      ) : null}
      {items.length ? (
        <ol className={cn("space-y-2", field.compact && "space-y-1.5")}>
          {items.map((item, index) => {
            const key = keys[index];
            const expanded = open.has(key);
            const meta = field.itemMeta?.(item);
            return (
              <li
                key={key}
                // Top-level rows can be opened from elsewhere (the collage preview's Edit button).
                data-root-row={field.label ? undefined : index}
                className={cn(
                  "scroll-mt-6 overflow-hidden rounded-2xl border bg-surface transition-shadow",
                  expanded ? "border-accent/40 shadow-[0_12px_32px_-20px_rgb(0_0_0/0.35)]" : "border-line",
                )}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={expanded}
                  onClick={() => toggle(key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(key);
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-4 hover:bg-surface-2/60",
                    field.compact ? "py-2.5" : "py-3.5",
                  )}
                >
                  <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", !expanded && "-rotate-90")} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn("truncate font-medium", field.compact && "text-[15px]")}>{field.itemLabel(item)}</span>
                      {pin && item?.[pin.key] ? (
                        <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                          {pin.label}
                        </span>
                      ) : null}
                    </span>
                    {meta ? <span className="block truncate text-xs text-muted">{meta}</span> : null}
                  </span>
                  <span className="flex shrink-0 items-center">
                    {pin ? (
                      <PinButton
                        pinned={Boolean(item?.[pin.key])}
                        label={pin.label}
                        full={pinnedCount >= pin.max}
                        max={pin.max}
                        onToggle={() => togglePin(index)}
                      />
                    ) : null}
                    <IconButton label="Move up" disabled={!canMove(index, -1)} onClick={() => reorder(index, index - 1)}>
                      <ArrowUp className="size-4" />
                    </IconButton>
                    <IconButton label="Move down" disabled={!canMove(index, 1)} onClick={() => reorder(index, index + 1)}>
                      <ArrowDown className="size-4" />
                    </IconButton>
                    <IconButton
                      label="Delete"
                      danger
                      onClick={() => {
                        if (!window.confirm(`Delete “${field.itemLabel(item)}”?`)) return;
                        setKeys(keys.filter((_, i) => i !== index));
                        onChange(items.filter((_, i) => i !== index));
                      }}
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </span>
                </div>
                {expanded ? (
                  <div className="border-t border-line bg-bg/40 p-4 sm:p-5">
                    <ObjectInput
                      field={{ kind: "object", key: "", label: "", fields: field.fields }}
                      value={item}
                      onChange={(next) => onChange(items.map((it, i) => (i === index ? next : it)))}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-sm text-muted">Nothing here yet.</p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AddButton
          onClick={() => {
            const key = newKey();
            setKeys([...keys, key]);
            setOpen((prev) => new Set(prev).add(key));
            onChange([...items, field.newItem()]);
          }}
        >
          {field.addLabel}
        </AddButton>
        {footer ? <p className="text-sm font-medium text-accent">{footer}</p> : null}
      </div>
    </div>
  );

  if (!field.label) return list;
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{field.label}</p>
        {field.help ? <p className="text-xs text-muted">{field.help}</p> : null}
      </div>
      {list}
    </div>
  );
}

function StringsInput({ field, value, onChange }: Props<Extract<Field, { kind: "strings" }>>) {
  const items: string[] = Array.isArray(value) ? value : [];
  const [keys, setKeys] = useKeys(items.length);

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{field.label}</p>
        {field.help ? <p className="text-xs text-muted">{field.help}</p> : null}
      </div>
      {items.length ? (
        <ol className="space-y-2">
          {items.map((text, index) => (
            <li key={keys[index]} className="flex items-start gap-1.5">
              {/* Grows with its text, so long bullet points stay readable. */}
              <textarea
                value={text}
                rows={field.multiline ? 3 : 1}
                aria-label={`${field.label} ${index + 1}`}
                onChange={(e) => onChange(items.map((t, i) => (i === index ? e.target.value : t)))}
                className={cn(
                  inputClass,
                  "field-sizing-content resize-none leading-relaxed",
                  field.multiline ? "min-h-20" : "py-2",
                )}
              />
              <span className={cn("flex shrink-0", field.multiline ? "flex-col" : "items-center pt-0.5")}>
                <IconButton
                  label="Move up"
                  disabled={index === 0}
                  onClick={() => {
                    setKeys(move(keys, index, index - 1));
                    onChange(move(items, index, index - 1));
                  }}
                >
                  <ArrowUp className="size-4" />
                </IconButton>
                <IconButton
                  label="Remove"
                  danger
                  onClick={() => {
                    setKeys(keys.filter((_, i) => i !== index));
                    onChange(items.filter((_, i) => i !== index));
                  }}
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </span>
            </li>
          ))}
        </ol>
      ) : null}
      <AddButton
        onClick={() => {
          setKeys([...keys, newKey()]);
          onChange([...items, ""]);
        }}
      >
        {field.addLabel ?? "Add"}
      </AddButton>
    </div>
  );
}

const isVideoUrl = (url: string) => /\.(mp4|webm|mov)$/i.test(url) || /youtu\.?be/.test(url);

/**
 * Photos and videos for one place on the site: upload several at once,
 * reorder, replace or remove them. Several items rotate on the site.
 */
function MediaInput({ field, value, onChange }: Props<Extract<Field, { kind: "media" }>>) {
  const items: any[] = Array.isArray(value) ? value : [];
  const [keys, setKeys] = useKeys(items.length);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const adder = useRef<HTMLInputElement>(null);
  const replacer = useRef<HTMLInputElement>(null);
  const selectedIndex = selected ? keys.indexOf(selected) : -1;
  const current = selectedIndex >= 0 ? items[selectedIndex] : null;

  async function addFiles(files: File[]) {
    setError(null);
    setBusy(files.length);
    // Uploads run one after another; each result is appended to the growing list.
    let list = items;
    for (const file of files) {
      if (!/^(image|video)\//.test(file.type)) {
        setError(`“${file.name}” isn't a photo or video. Add PDFs under Documents instead.`);
        setBusy((n) => n - 1);
        continue;
      }
      try {
        const url = await uploadFile(file);
        const item = { type: file.type.startsWith("video/") ? "video" : "image", url, style: field.defaultStyle };
        list = [...list, item];
        setKeys((prev) => [...prev, newKey()]);
        onChange(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
      setBusy((n) => n - 1);
    }
  }

  const update = (index: number, patch: object) => onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  const shift = (index: number, by: number) => {
    setKeys(move(keys, index, index + by));
    onChange(move(items, index, index + by));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{field.label}</p>
        <p className="text-xs text-muted">
          {field.help ?? "Add one or more photos or videos."}
          {items.length > 1 ? " They rotate automatically on the site, in this order." : ""}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((item, index) => {
          const key = keys[index];
          const video = item.type === "video" || isVideoUrl(item.url ?? "");
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(selected === key ? null : key)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-xl border bg-surface-2 text-left transition",
                selected === key ? "border-accent ring-4 ring-accent/20" : "border-line hover:border-accent/50",
              )}
            >
              {video ? (
                <span className="grid size-full place-items-center">
                  <Film className="size-7 text-muted" strokeWidth={1.5} />
                </span>
              ) : item.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" className={cn("size-full", item.style === "photo" || !item.style ? "object-cover" : "object-contain p-1")} />
              ) : null}
              <span className="absolute left-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-black/55 text-[11px] font-semibold text-white">
                {index + 1}
              </span>
              {index === 0 && items.length > 1 ? (
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  First
                </span>
              ) : null}
            </button>
          );
        })}

        <button
          type="button"
          disabled={busy > 0}
          onClick={() => adder.current?.click()}
          className="grid aspect-square place-items-center rounded-xl border border-dashed border-line text-accent transition hover:border-accent hover:bg-accent-soft disabled:opacity-60"
        >
          <span className="flex flex-col items-center gap-1 text-xs font-medium">
            {busy ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" strokeWidth={1.5} />}
            {busy ? `Uploading ${busy}…` : "Add photos / videos"}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="…or paste a YouTube / image link"
          className={cn(inputClass, "py-2 text-sm")}
        />
        <button
          type="button"
          disabled={!link.trim()}
          onClick={() => {
            const url = link.trim();
            setKeys([...keys, newKey()]);
            onChange([...items, { type: isVideoUrl(url) ? "video" : "image", url, style: field.defaultStyle }]);
            setLink("");
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-sm font-medium transition hover:border-accent hover:text-accent disabled:opacity-40"
        >
          <Link2 className="size-4" /> Add
        </button>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      {current ? (
        <div className="space-y-4 rounded-2xl border border-accent/40 bg-bg/40 p-4">
          <div className="flex flex-wrap items-center gap-1">
            <p className="mr-auto text-sm font-medium">Item {selectedIndex + 1}</p>
            <IconButton label="Move earlier" disabled={selectedIndex === 0} onClick={() => shift(selectedIndex, -1)}>
              <ArrowLeft className="size-4" />
            </IconButton>
            <IconButton label="Move later" disabled={selectedIndex === items.length - 1} onClick={() => shift(selectedIndex, 1)}>
              <ArrowRight className="size-4" />
            </IconButton>
            <IconButton label="Replace file" onClick={() => replacer.current?.click()}>
              <RefreshCw className="size-4" />
            </IconButton>
            <IconButton
              label="Remove"
              danger
              onClick={() => {
                setKeys(keys.filter((_, i) => i !== selectedIndex));
                onChange(items.filter((_, i) => i !== selectedIndex));
                setSelected(null);
              }}
            >
              <Trash2 className="size-4" />
            </IconButton>
            <IconButton label="Close" onClick={() => setSelected(null)}>
              <X className="size-4" />
            </IconButton>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="block text-sm font-medium">File or link</span>
              <input value={current.url ?? ""} onChange={(e) => update(selectedIndex, { url: e.target.value })} className={cn(inputClass, "py-2 text-sm")} />
            </label>
            <label className="space-y-1.5">
              <span className="block text-sm font-medium">Type</span>
              <select value={current.type} onChange={(e) => update(selectedIndex, { type: e.target.value })} className={inputClass}>
                <option value="image">Photo</option>
                <option value="video">Video</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="block text-sm font-medium">Fit</span>
              <select
                value={current.style ?? field.defaultStyle ?? "photo"}
                onChange={(e) => update(selectedIndex, { style: e.target.value })}
                className={inputClass}
              >
                <option value="photo">Photo — fill the frame</option>
                <option value="document">Certificate — show whole</option>
                <option value="cutout">Cut-out portrait</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="block text-sm font-medium">Caption</span>
              <input value={current.caption ?? ""} onChange={(e) => update(selectedIndex, { caption: e.target.value })} className={inputClass} />
            </label>
            <label className="space-y-1.5">
              <span className="block text-sm font-medium">Description (alt text)</span>
              <input value={current.alt ?? ""} onChange={(e) => update(selectedIndex, { alt: e.target.value })} className={inputClass} />
            </label>
          </div>
        </div>
      ) : items.length ? (
        <p className="text-xs text-muted">Click a thumbnail to reorder, replace or remove it.</p>
      ) : null}

      <input
        ref={adder}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) addFiles(files);
        }}
      />
      <input
        ref={replacer}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file || selectedIndex < 0) return;
          setBusy(1);
          try {
            const url = await uploadFile(file);
            update(selectedIndex, { url, type: file.type.startsWith("video/") ? "video" : "image" });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
          }
          setBusy(0);
        }}
      />
    </div>
  );
}
