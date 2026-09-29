import { Award, BrainCircuit, Code2, Database, Rocket, Smartphone, Cpu } from "lucide-react";
import type { JourneyItem, SectionText, SkillGroup } from "@/content/types";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { StatusBadge, Tag } from "@/components/ui/tag";
import { RotatingStack } from "@/components/ui/rotating-stack";
import { buildTiles, collageGridClass, fillerSize, skillSizes, tileClass } from "@/lib/collage";
import { cn } from "@/lib/cn";

const icons: Record<string, typeof Cpu> = {
  ai: BrainCircuit,
  ml: Cpu,
  languages: Code2,
  data: Database,
  mobile: Smartphone,
  deploy: Rocket,
};

export function Skills({ groups, highlight, text }: { groups: SkillGroup[]; highlight?: JourneyItem; text: SectionText }) {
  // The first box is the wide, dark lead card; groups sharing a merge group rotate in one box.
  const tiles = buildTiles(groups, (group) => group.id, skillSizes);

  return (
    <Section id="skills" text={text}>
      <div className={collageGridClass}>
        {tiles.map((tile, index) => (
          <Reveal key={tile.key} delay={index * 0.04} className={tileClass(tile.size)}>
            {tile.members.length > 1 ? (
              <RotatingStack labels={tile.members.map((group) => group.title)}>
                {tile.members.map((group) => (
                  <SkillCard key={group.id} group={group} featured={index === 0} />
                ))}
              </RotatingStack>
            ) : (
              <SkillCard group={tile.members[0]} featured={index === 0} />
            )}
          </Reveal>
        ))}

        {highlight ? (
          <Reveal
            className={cn(
              "flex flex-col justify-between rounded-3xl border border-line bg-gradient-to-br from-accent-soft to-surface p-7",
              tileClass(fillerSize(tiles.map((tile) => tile.size))),
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <Award className="size-7 text-accent" strokeWidth={1.5} />
              {highlight.status ? <StatusBadge status={highlight.status} /> : null}
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold tracking-tight">{highlight.title}</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{highlight.summary}</p>
              <a href={`#${highlight.id}`} className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
                See the details in my journey →
              </a>
            </div>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}

function SkillCard({ group, featured }: { group: SkillGroup; featured: boolean }) {
  const Icon = icons[group.id] ?? Code2;
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-3xl border border-line p-7",
        featured ? "bg-fg text-bg" : "bg-surface",
      )}
    >
      <Icon className={cn("size-7", featured ? "text-bg/70" : "text-accent")} strokeWidth={1.5} />
      <h3 className={cn("mt-6 font-semibold tracking-tight", featured ? "text-3xl" : "text-xl")}>{group.title}</h3>
      <p className={cn("mt-1 text-sm", featured ? "text-bg/60" : "text-muted")}>{group.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {group.skills.map((skill) => (
          <Tag key={skill} className={featured ? "bg-bg/10 text-bg" : undefined}>
            {skill}
          </Tag>
        ))}
      </div>
    </div>
  );
}
