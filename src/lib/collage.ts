// Collage layouts for Education and Skills.
// Tiles sit on a 6-column grid (2 columns on tablets, 1 on phones). Each
// section picks sizes automatically from how many tiles it has; any entry
// can override its own size from the admin panel. Entries that share a
// merge group become one tile that rotates between them.

export type TileSize = "full" | "row" | "large" | "medium" | "tall" | "wide" | "half" | "normal";

export const tileSizeLabels: Record<TileSize, string> = {
  full: "Full width, 2 rows",
  row: "Full width, 1 row",
  large: "Large (2/3 width, 2 rows)",
  medium: "Medium (1/2 width, 2 rows)",
  tall: "Tall (1/3 width, 2 rows)",
  wide: "Wide (2/3 width)",
  half: "Half (1/2 width)",
  normal: "Normal (1/3 width)",
};

// Written out in full so Tailwind can see every class.
const spans: Record<TileSize, string> = {
  full: "sm:col-span-2 lg:col-span-6 lg:row-span-2",
  row: "sm:col-span-2 lg:col-span-6",
  large: "sm:col-span-2 lg:col-span-4 lg:row-span-2",
  medium: "sm:col-span-2 lg:col-span-3 lg:row-span-2",
  tall: "lg:col-span-2 lg:row-span-2",
  wide: "sm:col-span-2 lg:col-span-4",
  half: "lg:col-span-3",
  normal: "lg:col-span-2",
};

export const collageGridClass = "grid gap-4 sm:grid-cols-2 lg:grid-flow-dense lg:grid-cols-6";

export function tileClass(size: TileSize) {
  return spans[size];
}

/** Big tiles get the featured (dark) card treatment. */
export function isBigTile(size: TileSize) {
  return size === "full" || size === "large" || size === "medium";
}

/**
 * Education: the first entry is always the big one.
 * 3 → big + two stacked beside it; 4 → big, a smaller tall one, two halves;
 * 5 → big, two stacked beside it, two halves below.
 */
export function educationSizes(count: number): TileSize[] {
  switch (count) {
    case 0:
      return [];
    case 1:
      return ["full"];
    case 2:
      return ["large", "tall"];
    case 3:
      return ["large", "normal", "normal"];
    case 4:
      return ["large", "tall", "half", "half"];
    case 5:
      return ["large", "normal", "normal", "half", "half"];
    default:
      return ["large", "normal", "normal", ...Array<TileSize>(count - 3).fill("normal")];
  }
}

/** Skills: a wide lead card, then rows of three. */
export function skillSizes(count: number): TileSize[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? "wide" : "normal"));
}

export type Tile<T> = { key: string; members: T[]; size: TileSize };

/**
 * Groups entries into tiles (entries with the same `group` share a tile,
 * placed where the first of them is) and sizes each tile: its first
 * member's own `tile` setting wins, otherwise the automatic layout.
 */
export function buildTiles<T extends { group?: string; tile?: TileSize | "auto" }>(
  items: T[],
  keyOf: (item: T) => string,
  autoSizes: (count: number) => TileSize[],
): Tile<T>[] {
  const tiles: { key: string; members: T[] }[] = [];
  const byGroup = new Map<string, { key: string; members: T[] }>();
  for (const item of items) {
    const group = item.group?.trim().toLowerCase();
    const existing = group ? byGroup.get(group) : undefined;
    if (existing) {
      existing.members.push(item);
      continue;
    }
    const tile = { key: keyOf(item), members: [item] };
    tiles.push(tile);
    if (group) byGroup.set(group, tile);
  }
  const auto = autoSizes(tiles.length);
  return tiles.map((tile, i) => {
    const own = tile.members[0].tile;
    return { ...tile, size: own && own !== "auto" ? own : auto[i] };
  });
}

const area: Record<TileSize, number> = { full: 12, row: 6, large: 8, medium: 6, tall: 4, wide: 4, half: 3, normal: 2 };

/** The size that fills out the last row after these tiles (for a closing card). */
export function fillerSize(sizes: TileSize[]): TileSize {
  const used = sizes.reduce((sum, size) => sum + area[size], 0) % 6;
  return ({ 0: "row", 2: "wide", 3: "half", 4: "normal" } as Record<number, TileSize>)[used] ?? "wide";
}
