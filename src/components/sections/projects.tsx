import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project, SectionText } from "@/content/types";
import { Carousel } from "@/components/ui/carousel";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { MediaRotator } from "@/components/ui/media-rotator";
import { StatusBadge, Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";

export function Projects({ projects, text }: { projects: Project[]; text: SectionText }) {
  // The first three featured projects stay pinned; everything else scrolls below.
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const more = projects.filter((p) => !featured.includes(p));

  return (
    <Section id="projects" text={text}>
      <div className="grid gap-4 lg:grid-cols-2">
        {featured.map((project, index) => (
          <Reveal key={project.slug} delay={index * 0.05} className={index === 0 ? "lg:col-span-2" : undefined}>
            <Link
              href={`/projects/${project.slug}`}
              className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-7 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgb(0_0_0/0.3)] sm:p-9"
            >
              {project.media.length ? (
                <MediaRotator
                  items={project.media}
                  alt={project.title}
                  sizes={index === 0 ? "(min-width: 1024px) 1100px, 100vw" : "(min-width: 1024px) 540px, 100vw"}
                  controls={false}
                  className={cn(
                    "-mx-3 -mt-3 mb-7 rounded-2xl bg-surface-2 sm:-mx-5 sm:-mt-5",
                    index === 0 ? "aspect-[21/9]" : "aspect-video",
                  )}
                />
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-accent">{project.category}</span>
                <StatusBadge status={project.status} />
              </div>
              <h3
                className={
                  index === 0
                    ? "mt-6 text-4xl font-semibold tracking-tight sm:text-5xl"
                    : "mt-6 text-3xl font-semibold tracking-tight"
                }
              >
                {project.title}
              </h3>
              <p className="mt-1 text-lg text-muted">{project.subtitle}</p>
              <p className="mt-5 max-w-2xl leading-relaxed text-pretty">{project.summary}</p>
              {project.presentedAt ? (
                <p className="mt-4 text-sm font-medium text-muted">
                  Presented at {project.presentedAt.split(" — ")[0]}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-2">
                {project.tech.slice(0, 6).map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </div>
              <span className="mt-auto inline-flex items-center gap-1 pt-8 text-sm font-medium text-accent">
                Read case study
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      {more.length ? (
        <Reveal className="mt-16">
          <Carousel
            label="More projects"
            heading={<h3 className="text-sm font-semibold text-muted">More projects</h3>}
            itemClassName="w-[80%] sm:w-[360px]"
          >
            {more.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-7 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgb(0_0_0/0.3)]"
              >
                {project.media.length ? (
                  <MediaRotator
                    items={project.media}
                    alt={project.title}
                    sizes="360px"
                    controls={false}
                    className="-mx-3 -mt-3 mb-6 aspect-video rounded-2xl bg-surface-2"
                  />
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-accent">{project.category}</span>
                  <StatusBadge status={project.status} />
                </div>
                <h4 className="mt-5 text-2xl font-semibold tracking-tight">{project.title}</h4>
                <p className="mt-1 text-muted">{project.subtitle}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-pretty">{project.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.tech.slice(0, 4).map((tech) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </div>
                <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-accent">
                  Read case study
                  <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </Carousel>
        </Reveal>
      ) : null}
    </Section>
  );
}
