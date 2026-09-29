import Link from "next/link";
import { ArrowUpRight, BadgeCheck, GraduationCap, Mic, Trophy } from "lucide-react";
import type { JourneyItem, SectionText } from "@/content/types";
import { Reveal } from "@/components/ui/reveal";
import { Carousel } from "@/components/ui/carousel";
import { MediaRotator } from "@/components/ui/media-rotator";
import { Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/ui/tag";
import { TermChart } from "@/components/ui/term-chart";
import { RotatingStack } from "@/components/ui/rotating-stack";
import { buildTiles, collageGridClass, educationSizes, isBigTile, tileClass } from "@/lib/collage";
import { ExperienceList } from "./experience";
import { InstitutionSheet } from "./institution-dialog";
import { cn } from "@/lib/cn";

export function Journey({ items, text }: { items: JourneyItem[]; text: SectionText }) {
  const education = items.filter((item) => item.kind === "education");
  const roles = items.filter((item) => item.kind === "experience" || item.kind === "leadership");
  // Pinned honours come first; the rest keep their order.
  const allHonours = items.filter((item) => item.kind === "award" || item.kind === "event");
  const honours = [...allHonours.filter((item) => item.pinned), ...allHonours.filter((item) => !item.pinned)];

  // Admin order decides: the first tile is the big one. Entries sharing a
  // merge group rotate inside one tile.
  const educationTiles = buildTiles(education, (item) => item.id, educationSizes);

  return (
    <Section id="journey" text={text}>
      {educationTiles.length ? (
        <Group title="Education">
          <div className={cn(collageGridClass, "lg:auto-rows-[minmax(11rem,auto)]")}>
            {educationTiles.map((tile, index) => {
              const Card = isBigTile(tile.size) ? PrimaryEducation : EducationCard;
              return (
                <Reveal key={tile.key} delay={0.05 * index} className={tileClass(tile.size)}>
                  {tile.members.length > 1 ? (
                    <RotatingStack labels={tile.members.map((item) => item.organization ?? item.title)}>
                      {tile.members.map((item) => (
                        <Card key={item.id} item={item} group={tile.members} />
                      ))}
                    </RotatingStack>
                  ) : (
                    <Card item={tile.members[0]} />
                  )}
                </Reveal>
              );
            })}
          </div>
        </Group>
      ) : null}

      {roles.length ? (
        <Reveal className="mt-40 sm:mt-52">
          <GroupTitle className="mb-5">Experience & leadership</GroupTitle>
          <ExperienceList items={roles} />
        </Reveal>
      ) : null}

      {honours.length ? (
        <Reveal className="mt-12">
          <Carousel
            label="Honours, talks and events"
            heading={<GroupTitle>Honours, talks & events</GroupTitle>}
            itemClassName="w-[70%] sm:w-[270px]"
          >
            {honours.map((item) => (
              <HonourCard key={item.id} item={item} />
            ))}
          </Carousel>
        </Reveal>
      ) : null}
    </Section>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <GroupTitle className="mb-5">{title}</GroupTitle>
      {children}
    </div>
  );
}

function GroupTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-sm font-semibold text-muted", className)}>{children}</h3>;
}

type CardProps = {
  item: JourneyItem;
  /** Every entry in a merged tile, so its details sheet shows them together. */
  group?: JourneyItem[];
};

function PrimaryEducation({ item, group }: CardProps) {
  const [score, ...scale] = (item.grade ?? "").split(" ");

  return (
    <article className="relative flex h-full flex-col justify-between gap-8 rounded-3xl bg-fg p-7 text-bg transition-transform hover:-translate-y-0.5 sm:p-9">
      <div>
        <div className="flex items-center justify-between gap-4 text-sm text-bg/60">
          <span>
            {item.start} — {item.end ?? "Present"}
          </span>
          <InstitutionSheet
            item={item}
            items={group}
            label={`${item.organization} — view details`}
            className="inline-flex items-center gap-1 rounded-full bg-bg/10 px-3 py-1 text-xs font-medium text-bg transition-colors after:absolute after:inset-0 after:rounded-3xl hover:bg-bg/20"
          >
            <GraduationCap className="size-4" strokeWidth={1.75} /> Details
          </InstitutionSheet>
        </div>
        <h4 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{item.title}</h4>
        <p className="mt-2 text-lg text-bg/70">
          {item.organization}
          {item.location ? ` · ${item.location}` : ""}
        </p>
        {item.highlights?.length ? (
          <ul className="mt-5 space-y-2 text-[15px] leading-relaxed text-bg/70">
            {item.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-bg/40" />
                {highlight}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {item.grade ? (
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="shrink-0">
            <p className="text-6xl font-semibold tracking-tight sm:text-7xl">{score}</p>
            <p className="mt-1 text-bg/60">{scale.join(" ")}</p>
          </div>
          {item.grades?.length ? <TermChart grades={item.grades} inverted className="w-full sm:w-1/2" /> : null}
        </div>
      ) : null}
    </article>
  );
}

function EducationCard({ item, group }: CardProps) {
  return (
    <article className="group relative flex h-full flex-col rounded-3xl border border-line bg-surface p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgb(0_0_0/0.3)]">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>
          {item.start} — {item.end ?? "Present"}
        </span>
        {item.status === "in-progress" ? <StatusBadge status="in-progress" /> : null}
      </div>
      <h4 className="mt-3 text-lg font-semibold leading-snug tracking-tight">{item.title}</h4>
      <p className="mt-1 text-sm text-muted">
        {item.organization}
        {item.location ? ` · ${item.location}` : ""}
      </p>
      {item.grade ? <p className="mt-3 text-2xl font-semibold tracking-tight">{item.grade}</p> : null}
      <div className="mt-auto pt-4">
        {/* The ::after overlay stretches this button over the whole card. */}
        <InstitutionSheet
          item={item}
          items={group}
          label={`${item.title}, ${item.organization} — view details`}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent after:absolute after:inset-0 after:rounded-3xl"
        >
          {detailsLabel(item)}
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </InstitutionSheet>
      </div>
    </article>
  );
}

/** "3 courses · 1 document · View details" */
function detailsLabel(item: JourneyItem) {
  const courses = item.courses?.length ?? 0;
  const docs = item.links?.length ?? 0;
  return [
    courses ? `${courses} course${courses > 1 ? "s" : ""}` : "",
    docs ? `${docs} document${docs > 1 ? "s" : ""}` : "",
    "View details",
  ]
    .filter(Boolean)
    .join(" · ");
}

const honourIcons = { award: Trophy, event: Mic } as const;

function HonourCard({ item }: { item: JourneyItem }) {
  const Icon = honourIcons[item.kind as "award" | "event"] ?? Trophy;
  // A card links to its page, or failing that to its verifiable credential.
  const href = item.url ?? item.credentialUrl;
  const internal = href?.startsWith("/");
  const first = item.media?.[0];

  const body = (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all",
        href && "group-hover:-translate-y-0.5 group-hover:shadow-[0_20px_50px_-24px_rgb(0_0_0/0.3)]",
      )}
    >
      <div
        className={cn(
          "relative aspect-[4/3] shrink-0 overflow-hidden",
          !first
            ? "bg-gradient-to-br from-accent/20 via-accent-soft to-surface-2"
            : first.style === "document"
              ? "border-b border-line bg-surface-2"
              : "bg-gradient-to-b from-surface-2 to-accent/10",
        )}
      >
        {item.media?.length ? (
          <MediaRotator
            items={item.media}
            alt={item.title}
            sizes="(min-width: 640px) 270px, 70vw"
            fallbackStyle="document"
            controls={!href}
            className="size-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          // No photo yet: a quiet visual panel keeps every card the same shape.
          <div className="grid size-full place-items-center">
            <Icon className="size-20 text-accent/70" strokeWidth={1} />
          </div>
        )}
        {item.result ? (
          <span className="absolute left-3 top-3 rounded-full bg-surface/85 px-3 py-1 text-xs font-semibold text-fg shadow-sm backdrop-blur">
            {item.result}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-sm font-semibold leading-snug tracking-tight">{item.title}</h4>
        <p className="mt-1 text-sm text-muted">{item.organization}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-xs text-muted">
          <span>
            {item.end && item.end !== item.start
              ? `${item.start} — ${item.end}`
              : item.end
                ? item.start
                : `${item.start} — Present`}
          </span>
          {!item.url && item.credentialUrl ? (
            <span className="inline-flex items-center gap-1 font-medium text-accent">
              <BadgeCheck className="size-3.5" strokeWidth={1.75} /> Verify credential
            </span>
          ) : href ? (
            <ArrowUpRight className="size-4 transition-colors group-hover:text-accent" />
          ) : null}
        </div>
      </div>
    </article>
  );

  if (!href) return body;
  return internal ? (
    <Link href={href} className="group block h-full">
      {body}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className="group block h-full">
      {body}
    </a>
  );
}
