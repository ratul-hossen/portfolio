import { MapPin } from "lucide-react";
import type { JourneyItem, Profile, SectionText } from "@/content/types";
import { InstitutionLink } from "./institution-dialog";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";

const stateLabels = { past: "Home", now: "Now", next: "Next" } as const;

/** Turns institution names in a sentence into buttons that open their details. */
function withInstitutionLinks(text: string, education: JourneyItem[]) {
  // Entries still being filled in may have no organisation yet.
  const names = [...new Set(education.map((item) => item.organization).filter(Boolean))];
  if (!names.length) return text;
  const pattern = new RegExp(`(${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
  return text.split(pattern).map((part, index) => {
    const item = education.find((entry) => entry.organization === part);
    return item ? (
      <InstitutionLink key={index} item={item}>
        {part}
      </InstitutionLink>
    ) : (
      part
    );
  });
}

export function About({ profile, education, text }: { profile: Profile; education: JourneyItem[]; text: SectionText }) {
  return (
    <Section id="about" text={text}>
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <Reveal className="space-y-5 text-lg leading-relaxed text-muted text-pretty">
          {profile.about.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{withInstitutionLinks(paragraph, education)}</p>
          ))}
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={0.1} className="rounded-3xl border border-line bg-surface p-7">
            <h3 className="text-sm font-semibold text-muted">Global journey</h3>
            <ol className="mt-5 space-y-5">
              {profile.route.map((stop, index) => (
                <li key={stop.place} className="relative flex gap-4">
                  {index < profile.route.length - 1 ? (
                    <span aria-hidden className="absolute left-[11px] top-7 h-[calc(100%-4px)] w-px bg-line" />
                  ) : null}
                  <span
                    className={
                      stop.state === "now"
                        ? "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-white"
                        : "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-surface-2 text-muted"
                    }
                  >
                    <MapPin className="size-3.5" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-semibold">
                      {stop.place}{" "}
                      <span className="ml-1 text-xs font-medium text-muted">· {stateLabels[stop.state]}</span>
                    </p>
                    <p className="text-sm text-muted">{withInstitutionLinks(stop.detail, education)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.15} className="rounded-3xl border border-line bg-surface p-7">
            <h3 className="text-sm font-semibold text-muted">Languages</h3>
            <ul className="mt-4 divide-y divide-line">
              {profile.languages.map((language) => (
                <li key={language.name} className="flex items-center justify-between py-2.5">
                  <span className="font-medium">{language.name}</span>
                  <span className="text-sm text-muted">{language.level}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
