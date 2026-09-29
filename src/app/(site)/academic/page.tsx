import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import type { JourneyItem } from "@/content/types";
import { StatusBadge } from "@/components/ui/tag";
import { getJourney, getProfile, getProjects, getResearch, getSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: "Academic Profile",
    description: `Academic record, research interests, languages and leadership of ${profile.name}.`,
  };
}

// A single, calm page that an admissions committee can read top to bottom.
export default async function AcademicPage() {
  const [profile, journey, research, projects, settings] = await Promise.all([
    getProfile(),
    getJourney(),
    getResearch(),
    getProjects(),
    getSettings(),
  ]);
  if (!settings.showAcademicPage) notFound();

  const education = journey.filter((item) => item.kind === "education");
  const service = journey.filter((item) => item.kind !== "education");

  return (
    <div className="px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-line pb-10">
          <p className="text-sm font-semibold text-accent">Academic Profile</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="mt-3 text-xl text-muted">{profile.headline}</p>
          <p className="mt-6 text-sm text-muted">
            {profile.location} ·{" "}
            <a href={`mailto:${profile.email}`} className="text-accent hover:underline">
              {profile.email}
            </a>
          </p>
        </header>

        <Block title="Education">
          <div className="space-y-8">
            {education.map((item) => (
              <Entry key={item.id} item={item}>
                {item.grades?.length ? (
                  <table className="mt-4 w-full max-w-sm text-sm">
                    <thead>
                      <tr className="text-left text-muted">
                        <th className="py-1.5 font-medium">Term</th>
                        <th className="py-1.5 text-right font-medium">GPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line border-t border-line">
                      {item.grades.map((grade) => (
                        <tr key={grade.term}>
                          <td className="py-1.5">{grade.term}</td>
                          <td className="py-1.5 text-right tabular-nums">{grade.gpa.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
              </Entry>
            ))}
          </div>
        </Block>

        <Block title="Research interests">
          <div className="space-y-4 text-lg leading-relaxed text-pretty">
            {research.statement.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {research.interests.map((interest) => (
              <li key={interest.title} className="rounded-2xl bg-surface-2 p-4">
                <p className="font-semibold">{interest.title}</p>
                <p className="text-sm text-muted">{interest.description}</p>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Selected projects">
          <ul className="divide-y divide-line">
            {projects
              .filter((project) => project.featured)
              .map((project) => (
                <li key={project.slug} className="py-4 first:pt-0">
                  <Link href={`/projects/${project.slug}`} className="group flex items-start justify-between gap-6">
                    <div>
                      <p className="font-semibold group-hover:text-accent">
                        {project.title} — {project.subtitle}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{project.summary}</p>
                    </div>
                    <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted group-hover:text-accent" />
                  </Link>
                </li>
              ))}
          </ul>
        </Block>

        <Block title="Leadership, service & awards">
          <div className="space-y-8">
            {service.map((item) => (
              <Entry key={item.id} item={item} />
            ))}
          </div>
        </Block>

        <Block title="Languages">
          <ul className="grid gap-3 sm:grid-cols-3">
            {profile.languages.map((language) => (
              <li key={language.name} className="rounded-2xl bg-surface-2 p-4">
                <p className="font-semibold">{language.name}</p>
                <p className="text-sm text-muted">{language.level}</p>
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-12 last:border-0">
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Entry({ item, children }: { item: JourneyItem; children?: React.ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-lg font-semibold">{item.title}</h3>
        <span className="text-sm text-muted">
          {item.start} — {item.end ?? "Present"}
        </span>
      </div>
      <p className="text-muted">
        {item.organization}
        {item.location ? ` · ${item.location}` : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {item.grade ? <span className="font-semibold">{item.grade}</span> : null}
        {item.status && item.status !== "completed" ? <StatusBadge status={item.status} /> : null}
      </div>
      {item.highlights?.length ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] text-muted marker:text-subtle">
          {item.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      ) : null}
      {children}
    </div>
  );
}
