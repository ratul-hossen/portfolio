import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PublicationStatusBadge } from "@/components/sections/research";
import { MediaRotator } from "@/components/ui/media-rotator";
import { Tag } from "@/components/ui/tag";
import { getProfile, getProject, getPublication, getResearch } from "@/lib/content";

export async function generateStaticParams() {
  const research = await getResearch();
  return research.publications.map((publication) => ({ slug: publication.slug }));
}

export async function generateMetadata(props: PageProps<"/research/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const publication = await getPublication(slug);
  if (!publication) return {};
  return {
    title: publication.title,
    description: publication.abstract,
    // Lets Google Scholar index the paper.
    other: {
      citation_title: publication.title,
      citation_author: publication.authors,
      citation_publication_date: publication.year,
      ...(publication.pdfUrl ? { citation_pdf_url: publication.pdfUrl } : {}),
    },
  };
}

export default async function PublicationPage(props: PageProps<"/research/[slug]">) {
  const { slug } = await props.params;
  const [publication, profile] = await Promise.all([getPublication(slug), getProfile()]);
  if (!publication) notFound();
  const project = publication.projectSlug ? await getProject(publication.projectSlug) : null;

  const links = [
    publication.pdfUrl && { label: "Read the paper (PDF)", url: publication.pdfUrl },
    publication.url && { label: "Publisher page", url: publication.url },
    publication.doi && { label: `DOI: ${publication.doi}`, url: `https://doi.org/${publication.doi}` },
    publication.codeUrl && { label: "Code", url: publication.codeUrl },
  ].filter((link): link is { label: string; url: string } => Boolean(link));

  const bibtexKey = `${profile.name.split(" ").at(-1)?.toLowerCase()}${publication.year}${publication.slug.split("-")[0]}`;
  const bibtex = `@inproceedings{${bibtexKey},
  title     = {${publication.title}},
  author    = {${publication.authors.join(" and ")}},
  booktitle = {${publication.venue}},
  year      = {${publication.year}}${publication.doi ? `,\n  doi       = {${publication.doi}}` : ""}
}`;

  return (
    <article className="px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-3xl">
        <Link href="/#research" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Research
        </Link>

        <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>{publication.year}</span>
          <PublicationStatusBadge status={publication.status} />
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{publication.title}</h1>
        <p className="mt-5 text-lg">
          {publication.authors.map((author, index) => (
            <span key={author}>
              {index ? ", " : ""}
              <span className={author === profile.name ? "font-semibold" : "text-muted"}>{author}</span>
            </span>
          ))}
        </p>
        <p className="mt-1 italic text-muted">{publication.venue}</p>

        {links.length ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((link, index) => (
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

        {publication.media?.length ? (
          <MediaRotator
            items={publication.media}
            alt={publication.title}
            sizes="(min-width: 768px) 768px, 100vw"
            fallbackStyle="document"
            className="mt-12 aspect-video rounded-3xl border border-line bg-surface-2"
          />
        ) : null}

        {publication.abstract ? (
          <section className="mt-14">
            <h2 className="text-sm font-semibold text-accent">Abstract</h2>
            <p className="mt-3 text-lg leading-relaxed text-pretty">{publication.abstract}</p>
          </section>
        ) : null}

        {publication.keywords?.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {publication.keywords.map((keyword) => (
              <Tag key={keyword}>{keyword}</Tag>
            ))}
          </div>
        ) : null}

        {project ? (
          <Link
            href={`/projects/${project.slug}`}
            className="mt-14 flex items-center justify-between gap-6 rounded-3xl border border-line bg-surface p-6 hover:bg-surface-2"
          >
            <div>
              <p className="text-sm text-muted">Related project</p>
              <p className="mt-1 font-semibold">
                {project.title} — {project.subtitle}
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-muted" />
          </Link>
        ) : null}

        <section className="mt-14">
          <h2 className="text-sm font-semibold text-accent">Cite</h2>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-surface-2 p-5 text-[13px] leading-relaxed">{bibtex}</pre>
        </section>
      </div>
    </article>
  );
}
