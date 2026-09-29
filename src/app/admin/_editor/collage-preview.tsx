"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ArrowLeft, ArrowRight, GripVertical, LayoutGrid, Link2, Pencil, Unlink, X } from "lucide-react";
import { useState } from "react";
import { buildTiles, fillerSize, isBigTile, type Tile, type TileSize } from "@/lib/collage";
import { cn } from "@/lib/cn";

// The preview's own grid (always six columns, whatever the screen size).
const previewSpan: Record<TileSize, string> = {
  full: "col-span-6 row-span-2",
  row: "col-span-6",
  large: "col-span-4 row-span-2",
  medium: "col-span-3 row-span-2",
  tall: "col-span-2 row-span-2",
  wide: "col-span-4",
  half: "col-span-3",
  normal: "col-span-2",
};

const sizeName: Record<TileSize, string> = {
  full: "Full",
  row: "Full row",
  large: "Large",
  medium: "Medium",
  tall: "Tall",
  wide: "Wide",
  half: "Half",
  normal: "Normal",
};

const sizeChoices: (TileSize | "auto")[] = ["auto", "large", "medium", "tall", "wide", "half", "normal", "full", "row"];

/**
 * A live miniature of the section's collage that you edit directly: click a
 * box to pick its size, move it, merge it with the next box or split it
 * apart; drag boxes to reorder. Sizes are chosen from the ones the grid
 * supports, so the site's layout can't break.
 */
export function CollagePreview({
  items,
  onChange,
  autoSizes,
  labelOf,
  closingCard,
}: {
  items: any[];
  onChange: (items: any[]) => void;
  autoSizes: (count: number) => TileSize[];
  labelOf: (item: any) => string;
  /** A fixed card after the boxes (the Skills highlight card), sized to fill the last row. */
  closingCard?: string;
}) {
  const tiles = buildTiles(items, (item) => item.id || labelOf(item), autoSizes);
  const closing = closingCard ? fillerSize(tiles.map((tile) => tile.size)) : null;
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const selectedIndex = tiles.findIndex((tile) => tile.key === selectedKey);
  const selected = selectedIndex >= 0 ? tiles[selectedIndex] : null;

  // Every change rebuilds the list from tiles, so merged entries stay together.
  const commit = (next: Tile<any>[]) => onChange(next.flatMap((tile) => tile.members));

  const moveTile = (from: number, to: number) => {
    if (to < 0 || to >= tiles.length || from === to) return;
    const next = [...tiles];
    const [tile] = next.splice(from, 1);
    next.splice(to, 0, tile);
    commit(next);
  };

  const patchTile = (index: number, patch: (item: any) => any) =>
    commit(tiles.map((tile, i) => (i === index ? { ...tile, members: tile.members.map(patch) } : tile)));

  const setSize = (index: number, size: TileSize | "auto") =>
    patchTile(index, (item) => ({ ...item, tile: size === "auto" ? undefined : size }));

  const mergeWithNext = (index: number) => {
    const a = tiles[index];
    const b = tiles[index + 1];
    if (!b) return;
    const name =
      a.members[0].group ||
      b.members[0].group ||
      a.members[0].id ||
      labelOf(a.members[0]).toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
      "merged";
    const next = tiles.map((tile, i) =>
      i === index || i === index + 1 ? { ...tile, members: tile.members.map((m) => ({ ...m, group: name })) } : tile,
    );
    commit(next);
  };

  const unmerge = (index: number) => patchTile(index, (item) => ({ ...item, group: undefined }));

  const edit = (tile: Tile<any>) => {
    const row = document.querySelector<HTMLElement>(`[data-root-row="${items.indexOf(tile.members[0])}"]`);
    if (!row) return;
    row.scrollIntoView({ behavior: "smooth", block: "start" });
    const header = row.querySelector<HTMLElement>('[role="button"][aria-expanded="false"]');
    header?.click();
  };

  return (
    <section className="mb-8 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <LayoutGrid className="size-4 text-accent" /> Layout on the site
        </p>
        <p className="text-xs text-muted">Click a box to change it · drag to reorder</p>
      </div>

      <div className="grid auto-rows-[3.5rem] grid-flow-dense grid-cols-6 gap-1.5">
        {tiles.map((tile, i) => {
          const merged = tile.members.length > 1;
          const custom = tile.members[0].tile && tile.members[0].tile !== "auto";
          const dark = i === 0 || isBigTile(tile.size);
          const isSelected = tile.key === selectedKey;
          return (
            <button
              key={tile.key}
              type="button"
              draggable
              onDragStart={(e) => {
                setDragFrom(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (dragFrom === null) return;
                e.preventDefault();
                setDropAt(i);
              }}
              onDragLeave={() => setDropAt((at) => (at === i ? null : at))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragFrom !== null) moveTile(dragFrom, i);
                setDragFrom(null);
                setDropAt(null);
              }}
              onDragEnd={() => {
                setDragFrom(null);
                setDropAt(null);
              }}
              onClick={() => setSelectedKey(isSelected ? null : tile.key)}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex min-w-0 cursor-grab flex-col justify-between overflow-hidden rounded-lg p-2 text-left transition active:cursor-grabbing",
                previewSpan[tile.size],
                dark ? "bg-fg text-bg" : "border border-line bg-surface-2 hover:border-accent/60",
                merged && "outline-2 outline-offset-1 outline-accent/70 outline-dashed",
                isSelected && "ring-4 ring-accent",
                dragFrom === i && "opacity-40",
                dropAt === i && dragFrom !== i && "ring-4 ring-accent/50",
              )}
            >
              <span className="flex min-w-0 items-center gap-1">
                <GripVertical className={cn("size-3 shrink-0", dark ? "text-bg/40" : "text-subtle")} />
                <span className="truncate text-[11px] font-semibold leading-tight">
                  {tile.members.map((m) => labelOf(m) || "Untitled").join(" + ")}
                </span>
              </span>
              <span className={cn("truncate text-[10px]", dark ? "text-bg/60" : "text-muted")}>
                {sizeName[tile.size]}
                {custom ? " · set by you" : " · auto"}
                {merged ? " · rotates" : ""}
              </span>
            </button>
          );
        })}
        {closing && closingCard ? (
          <div
            className={cn(
              "flex flex-col justify-between rounded-lg border border-dashed border-line p-2 text-muted",
              previewSpan[closing],
            )}
          >
            <span className="truncate text-[11px] font-semibold">{closingCard}</span>
            <span className="text-[10px]">fills the last row</span>
          </div>
        ) : null}
      </div>

      {selected ? (
        <div className="mt-4 space-y-3 rounded-xl border border-accent/40 bg-bg/50 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-semibold">
              {selected.members.map((m) => labelOf(m) || "Untitled").join(" + ")}
            </p>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSelectedKey(null)}
              className="grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
            >
              <X className="size-4" />
            </button>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Size</p>
            <div className="flex flex-wrap gap-1.5">
              {sizeChoices.map((choice) => {
                const current = selected.members[0].tile ?? "auto";
                const active = current === choice;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setSize(selectedIndex, choice)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      active ? "bg-accent text-white" : "border border-line bg-surface hover:border-accent hover:text-accent",
                    )}
                  >
                    {choice === "auto" ? `Auto (${sizeName[autoSizeOf(selectedIndex)]})` : sizeName[choice]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <ToolButton disabled={selectedIndex === 0} onClick={() => moveTile(selectedIndex, selectedIndex - 1)}>
              <ArrowLeft className="size-3.5" /> Earlier
            </ToolButton>
            <ToolButton disabled={selectedIndex === tiles.length - 1} onClick={() => moveTile(selectedIndex, selectedIndex + 1)}>
              Later <ArrowRight className="size-3.5" />
            </ToolButton>
            {selectedIndex < tiles.length - 1 ? (
              <ToolButton onClick={() => mergeWithNext(selectedIndex)}>
                <Link2 className="size-3.5" /> Merge with next
              </ToolButton>
            ) : null}
            {selected.members.length > 1 ? (
              <ToolButton onClick={() => unmerge(selectedIndex)}>
                <Unlink className="size-3.5" /> Split apart
              </ToolButton>
            ) : null}
            {selected.members.map((member) => (
              <ToolButton key={member.id ?? labelOf(member)} onClick={() => edit({ ...selected, members: [member] })}>
                <Pencil className="size-3.5" /> Edit {selected.members.length > 1 ? labelOf(member) : "details"}
              </ToolButton>
            ))}
          </div>
          <p className="text-[11px] text-muted">
            The first box is always the big one. Save to keep changes, then check the site.
          </p>
        </div>
      ) : null}
    </section>
  );

  function autoSizeOf(index: number): TileSize {
    return autoSizes(tiles.length)[index] ?? "normal";
  }
}

function ToolButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
