// The admin panel's sections and how each maps onto the stored content.
// Journey entries share one list; each section edits its own kinds.

import type { JourneyItem, JourneyKind, SiteContent } from "@/content/types";

export const sectionIds = [
  "profile",
  "education",
  "experience",
  "honours",
  "projects",
  "skills",
  "research",
  "publications",
  "canvas",
  "settings",
] as const;

export type SectionId = (typeof sectionIds)[number];

export function isSectionId(value: string): value is SectionId {
  return (sectionIds as readonly string[]).includes(value);
}

const journeyKinds: Partial<Record<SectionId, JourneyKind[]>> = {
  education: ["education"],
  experience: ["experience", "leadership"],
  honours: ["award", "event"],
};

export function getSection(content: SiteContent, id: SectionId): unknown {
  const kinds = journeyKinds[id];
  if (kinds) return content.journey.filter((item) => kinds.includes(item.kind));
  switch (id) {
    case "research":
      return { statement: content.research.statement, interests: content.research.interests };
    case "publications":
      return content.research.publications;
    default:
      return content[id as Exclude<SectionId, "education" | "experience" | "honours" | "research" | "publications">];
  }
}

export function setSection(content: SiteContent, id: SectionId, value: unknown): SiteContent {
  const kinds = journeyKinds[id];
  if (kinds) {
    const others = content.journey.filter((item) => !kinds.includes(item.kind));
    const items = (value as JourneyItem[]).map((item) => ({ ...item, id: item.id || slugify(item.title) }));
    // Sections render their kinds in list order, so appending keeps each order intact.
    return { ...content, journey: [...others, ...items] };
  }
  switch (id) {
    case "research":
      return { ...content, research: { ...(value as object), publications: content.research.publications } as SiteContent["research"] };
    case "publications":
      return { ...content, research: { ...content.research, publications: value as SiteContent["research"]["publications"] } };
    default:
      return { ...content, [id]: value };
  }
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Drops empty strings and unset values so the stored JSON stays tidy. */
export function clean<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clean) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== "" && v !== undefined && v !== null)
        .map(([k, v]) => [k, clean(v)]),
    ) as T;
  }
  return value;
}
