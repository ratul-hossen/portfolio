import Link from "next/link";
import { ArrowRight, CloudUpload, HardDrive, Lock, Save } from "lucide-react";
import { computeCgpa } from "@/lib/grades";
import { loadDraft, storeMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const content = await loadDraft();
  const count = (...kinds: string[]) => content.journey.filter((item) => kinds.includes(item.kind)).length;
  const degree = content.journey.find((item) => item.kind === "education" && item.grades?.length);
  const cgpa = degree?.grades ? computeCgpa(degree.grades) : null;
  const pinnedPosts = content.canvas.instagramPosts.filter((post) => post.pinned).length;

  const cards = [
    { href: "/admin/education", label: "CGPA", value: cgpa?.toFixed(2) ?? "—", note: `${degree?.grades?.length ?? 0} semesters` },
    { href: "/admin/experience", label: "Roles", value: count("experience", "leadership"), note: "Experience & leadership" },
    { href: "/admin/honours", label: "Honours", value: count("award", "event"), note: `${content.journey.filter((i) => i.pinned).length} pinned` },
    { href: "/admin/projects", label: "Projects", value: content.projects.length, note: `${content.projects.filter((p) => p.featured).length} featured` },
    { href: "/admin/publications", label: "Papers", value: content.research.publications.length, note: "Publications" },
    { href: "/admin/canvas", label: "Instagram", value: content.canvas.instagramPosts.length, note: `${pinnedPosts} pinned` },
  ];

  const steps =
    storeMode === "local"
      ? [
          { icon: Save, title: "Edit & save", text: "Change anything in a section, then Save (or ⌘S). The site on this computer updates straight away." },
          { icon: CloudUpload, title: "Publish", text: "Publish commits your changes and uploads and pushes them to GitHub. Vercel updates the live site in about a minute." },
          { icon: HardDrive, title: "Files", text: "Uploaded photos are resized and saved as WebP in /public/uploads. PDFs and videos are kept as they are." },
        ]
      : [
          { icon: Save, title: "Edit & save", text: "Change anything in a section, then Save (or ⌘S). Each save is committed to your GitHub repository." },
          { icon: CloudUpload, title: "Goes live by itself", text: "Vercel sees the commit and rebuilds the site — your change is live in about a minute." },
          { icon: HardDrive, title: "Files", text: "Uploaded photos are resized to WebP and committed to /public/uploads. They appear after the next rebuild. Keep videos under 4 MB, or use a YouTube link." },
        ];

  const notes = {
    local: {
      title: "Running on your computer.",
      text: "Google sign-in is skipped here until you set it up. Publish pushes your changes to GitHub, and Vercel deploys them.",
    },
    github: {
      title: "Signed in with Google.",
      text: "Only the emails in ADMIN_EMAILS can open this panel. Your edits are saved to GitHub.",
    },
    readonly: {
      title: "Read-only.",
      text: "Add a GITHUB_TOKEN environment variable in Vercel so this panel can save your changes. The README shows how.",
    },
  }[storeMode];

  return (
    <div className="space-y-12 pb-16">
      <header>
        <p className="text-sm font-medium text-accent">Portfolio admin</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">Hello, {content.profile.shortName}.</h1>
        <p className="mt-2 text-muted">Everything on your site, in one place.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgb(0_0_0/0.3)]"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{card.value}</p>
            <p className="mt-2 flex items-center justify-between text-xs text-muted">
              {card.note}
              <ArrowRight className="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100" />
            </p>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted">How it works</h2>
        <ol className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {steps.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block font-medium">{title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex gap-4 rounded-2xl border border-dashed border-line p-5">
        <Lock className="mt-0.5 size-5 shrink-0 text-muted" strokeWidth={1.75} />
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-medium text-fg">{notes.title}</span> {notes.text}
        </p>
      </section>
    </div>
  );
}
