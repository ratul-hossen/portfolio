import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MediaRotator } from "@/components/ui/media-rotator";
import { Reveal } from "@/components/ui/reveal";
import { StatusBadge, Tag } from "@/components/ui/tag";
import { getProject, getProjects } from "@/lib/content";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <article className="px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-3xl">
        <Link href="/#projects" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> All projects
        </Link>

        <Reveal className="mt-10">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium text-accent">{project.category}</span>
            <span className="text-muted">{project.year}</span>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-6xl">{project.title}</h1>
          <p className="mt-3 text-2xl tracking-tight text-muted">{project.subtitle}</p>
          <p className="mt-8 text-xl leading-relaxed text-pretty">{project.summary}</p>

          {project.team?.length || project.presentedAt ? (
            <dl className="mt-8 grid gap-4 border-y border-line py-5 text-sm sm:grid-cols-2">
              {project.team?.length ? (
                <div>
                  <dt className="text-muted">{project.team.length > 1 ? "Collaborators" : "Collaborator"}</dt>
                  <dd className="mt-0.5 font-medium">{project.team.join(", ")}</dd>
                </div>
              ) : null}
              {project.presentedAt ? (
                <div>
                  <dt className="text-muted">Presented at</dt>
                  <dd className="mt-0.5 font-medium">{project.presentedAt}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {project.links.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.links.map((link, index) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={
                    index === 0
                      ? "inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-[15px] font-medium text-white hover:brightness-110"
                      : "inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-5 py-2.5 text-[15px] font-medium hover:bg-line"
                  }
                >
                  {link.label} <ArrowUpRight className="size-4" />
                </a>
              ))}
            </div>
          ) : null}
          {project.note ? <p className="mt-4 text-sm text-muted">{project.note}</p> : null}
        </Reveal>

        {project.media.length ? (
          <Reveal className="mt-14">
            <MediaRotator
              items={project.media}
              alt={project.title}
              sizes="(min-width: 1024px) 960px, 100vw"
              className="aspect-video rounded-3xl border border-line bg-surface-2"
            />
          </Reveal>
        ) : null}

        <div className="mt-16 space-y-14">
          <Reveal>
            <h2 className="text-sm font-semibold text-accent">The problem</h2>
            <p className="mt-3 text-lg leading-relaxed text-pretty">{project.problem}</p>
          </Reveal>
          <Reveal>
            <h2 className="text-sm font-semibold text-accent">The approach</h2>
            <ol className="mt-4 space-y-4">
              {project.approach.map((step, index) => (
                <li key={step} className="flex gap-4 text-lg leading-relaxed">
                  <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold tabular-nums">
                    {index + 1}
                  </span>
                  <span className="text-pretty">{step}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal>
            <h2 className="text-sm font-semibold text-accent">Outcome</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {project.impact.map((item) => (
                <li key={item} className="rounded-2xl border border-line bg-surface p-5 font-medium leading-snug">
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <h2 className="text-sm font-semibold text-accent">Built with</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
