// Form definitions for every admin section. The editor renders these
// generically, so adding a field to the site means adding one line here.

import { computeCgpa } from "@/lib/grades";
import type { GradeRecord } from "@/content/types";
import type { SectionId } from "../_lib/sections";
import { educationSizes, skillSizes, tileSizeLabels, type TileSize } from "@/lib/collage";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Item = any;

type Base = { key: string; label: string; help?: string; half?: boolean };

export type Field =
  | (Base & { kind: "text"; placeholder?: string })
  | (Base & { kind: "textarea"; rows?: number; placeholder?: string })
  | (Base & { kind: "number"; step?: number })
  | (Base & { kind: "boolean" })
  | (Base & { kind: "select"; options: { value: string; label: string }[] })
  | (Base & { kind: "file"; accept: string })
  | (Base & { kind: "media"; defaultStyle?: "photo" | "document" | "cutout" })
  | (Base & { kind: "strings"; multiline?: boolean; addLabel?: string })
  | (Base & {
      kind: "list";
      fields: Field[];
      itemLabel: (item: Item) => string;
      itemMeta?: (item: Item) => string | undefined;
      newItem: () => Item;
      addLabel: string;
      /** A line shown under the list, e.g. the computed CGPA. */
      footer?: (items: Item[]) => string | null;
      /** Start each item collapsed (long entries) or open (short rows). */
      compact?: boolean;
      /** A true/false field that puts items in front, with a cap on how many. */
      pin?: { key: string; max: number; label: string; note: string };
    })
  | (Base & { kind: "object"; fields: Field[]; optional?: { addLabel: string; newValue: () => Item } });

export type SectionSchema = {
  title: string;
  description: string;
  root: Field;
  /** Shows a live miniature of the section's collage above the list. */
  collage?: {
    autoSizes: (count: number) => TileSize[];
    labelOf: (item: Item) => string;
    closingCard?: string;
  };
};

const opt = (pairs: [string, string][]) => pairs.map(([value, label]) => ({ value, label }));

const tileOptions = [
  { value: "auto", label: "Auto — arranged for you" },
  ...Object.entries(tileSizeLabels).map(([value, label]) => ({ value, label })),
];

const collageFields = (what: string): Field[] => [
  {
    kind: "select",
    key: "tile",
    label: "Box size",
    half: true,
    options: tileOptions,
    help: "Auto picks a collage for the number of boxes; the first one is always the big one.",
  },
  {
    kind: "text",
    key: "group",
    label: "Merge group",
    half: true,
    placeholder: "e.g. exchange",
    help: `Give two or more ${what} the same name to show them in one box that switches between them.`,
  },
];

const statusOptions = opt([
  ["", "— None —"],
  ["completed", "Completed"],
  ["in-progress", "In progress"],
  ["upcoming", "Upcoming"],
]);

const dateFields: Field[] = [
  { kind: "text", key: "start", label: "Start", placeholder: "Aug 2026", half: true },
  { kind: "text", key: "end", label: "End", placeholder: "Leave empty for “Present”", half: true },
];

const media = (key: string, label: string, defaultStyle: "photo" | "document" | "cutout" = "photo", help?: string): Field => ({
  kind: "media",
  key,
  label,
  defaultStyle,
  help,
});

const linkList = (key: string, label: string): Field => ({
  kind: "list",
  key,
  label,
  addLabel: "Add link",
  compact: true,
  itemLabel: (l) => l.label || "New link",
  itemMeta: (l) => l.url,
  newItem: () => ({ label: "", url: "" }),
  fields: [
    { kind: "text", key: "label", label: "Label", half: true },
    { kind: "text", key: "url", label: "URL", half: true, placeholder: "https://… or /projects/…" },
  ],
});

const journeyBase: Field[] = [
  { kind: "text", key: "title", label: "Title" },
  { kind: "text", key: "organization", label: "Organisation", half: true },
  { kind: "text", key: "location", label: "Location", half: true },
  ...dateFields,
  { kind: "select", key: "status", label: "Status", options: statusOptions, half: true },
  { kind: "text", key: "id", label: "ID", half: true, help: "Short name used in links (e.g. #hackathon-2025). Filled in automatically." },
];

const sectionTextFields: Field[] = [
  { kind: "boolean", key: "show", label: "Show this section", half: true },
  { kind: "text", key: "navLabel", label: "Menu label", half: true, help: "Leave empty to keep it out of the top menu." },
  { kind: "text", key: "eyebrow", label: "Small label", half: true },
  { kind: "text", key: "title", label: "Heading", half: true },
  { kind: "textarea", key: "intro", label: "Intro", rows: 2 },
];

const journeyLabel = (item: Item) => item.title || "Untitled";
const journeyMeta = (item: Item) =>
  [item.organization, item.start && `${item.start}${item.end ? ` — ${item.end}` : ""}`].filter(Boolean).join(" · ");

const gradeFooter = (grades: GradeRecord[]) => {
  const valid = grades.filter((g) => typeof g.gpa === "number" && !Number.isNaN(g.gpa));
  const cgpa = computeCgpa(valid);
  if (cgpa === null) return null;
  const weighted = valid.every((g) => g.credits && g.credits > 0);
  return `CGPA on the site: ${cgpa.toFixed(2)} / 4.00 (${weighted ? "credit-weighted" : "average of terms — add credits for an exact CGPA"})`;
};

export const schemas: Record<SectionId, SectionSchema> = {
  profile: {
    title: "Profile",
    description: "Your name, headline, photo, About text and contact details.",
    root: {
      kind: "object",
      key: "",
      label: "",
      fields: [
        { kind: "text", key: "name", label: "Full name", half: true },
        { kind: "text", key: "shortName", label: "Short name (navbar)", half: true },
        { kind: "text", key: "headline", label: "Headline" },
        { kind: "textarea", key: "tagline", label: "Tagline", rows: 2 },
        {
          kind: "textarea",
          key: "currentStatus",
          label: "Line above your name (hero)",
          rows: 2,
          help: "Arabic text (e.g. an ayah) is shown right-to-left in a Qur'anic font.",
        },
        { kind: "text", key: "currentStatusSource", label: "Source under that line", placeholder: "— Al-Quran 39:53" },
        { kind: "text", key: "location", label: "Location" },
        media("portrait", "Portrait (hero)", "cutout", "Your photo on the home page. Add several and they rotate."),
        { kind: "file", key: "cvUrl", label: "CV (PDF)", accept: "application/pdf", help: "Adds a “Download CV” button when set." },
        { kind: "text", key: "email", label: "Email", half: true },
        { kind: "text", key: "whatsapp", label: "WhatsApp (footer only)", half: true },
        { kind: "strings", key: "about", label: "About — paragraphs", multiline: true, addLabel: "Add paragraph" },
        {
          kind: "list",
          key: "languages",
          label: "Languages",
          addLabel: "Add language",
          compact: true,
          itemLabel: (l) => l.name || "New language",
          itemMeta: (l) => l.level,
          newItem: () => ({ name: "", level: "" }),
          fields: [
            { kind: "text", key: "name", label: "Language", half: true },
            { kind: "text", key: "level", label: "Level", half: true, placeholder: "B2 (CEFR)" },
          ],
        },
        {
          kind: "list",
          key: "route",
          label: "Global journey (About)",
          addLabel: "Add stop",
          compact: true,
          itemLabel: (r) => r.place || "New stop",
          itemMeta: (r) => r.state,
          newItem: () => ({ place: "", detail: "", state: "next" }),
          fields: [
            { kind: "text", key: "place", label: "Place", half: true },
            { kind: "select", key: "state", label: "When", half: true, options: opt([["past", "Past"], ["now", "Now"], ["next", "Next"]]) },
            { kind: "text", key: "detail", label: "Detail" },
          ],
        },
        {
          kind: "list",
          key: "socials",
          label: "Social links",
          addLabel: "Add social link",
          compact: true,
          itemLabel: (s) => s.label || "New link",
          itemMeta: (s) => s.url,
          newItem: () => ({ platform: "website", label: "", url: "" }),
          fields: [
            {
              kind: "select",
              key: "platform",
              label: "Platform",
              half: true,
              options: opt([
                ["github", "GitHub"],
                ["linkedin", "LinkedIn"],
                ["instagram", "Instagram"],
                ["website", "Website"],
                ["blog", "Blog"],
                ["email", "Email"],
              ]),
            },
            { kind: "text", key: "label", label: "Label", half: true },
            { kind: "text", key: "url", label: "URL" },
          ],
        },
      ],
    },
  },

  education: {
    collage: { autoSizes: educationSizes, labelOf: (i) => i.organization || i.title },
    title: "Education",
    description: "Degrees and exchanges. Add each semester's GPA and the CGPA updates by itself.",
    root: {
      kind: "list",
      key: "",
      label: "",
      addLabel: "Add education",
      itemLabel: (i) => i.organization || "New education",
      itemMeta: (i) =>
        [
          i.tile && i.tile !== "auto" ? `Box: ${i.tile}` : "",
          i.group ? `Merged: ${i.group}` : "",
          i.title,
          i.start && `${i.start} — ${i.end ?? "Present"}`,
        ]
          .filter(Boolean)
          .join(" · "),
      newItem: () => ({ kind: "education", title: "", organization: "", start: "", status: "in-progress", grades: [], courses: [] }),
      fields: [
        ...journeyBase,
        ...collageFields("entries"),
        { kind: "textarea", key: "summary", label: "Summary", rows: 2 },
        { kind: "strings", key: "highlights", label: "Highlights", addLabel: "Add highlight" },
        {
          kind: "list",
          key: "grades",
          label: "Semester results",
          addLabel: "Add semester",
          compact: true,
          itemLabel: (g) => g.term || "New semester",
          itemMeta: (g) => (typeof g.gpa === "number" ? `GPA ${g.gpa.toFixed(2)}` : undefined),
          newItem: () => ({ term: "", gpa: 0 }),
          footer: gradeFooter,
          fields: [
            { kind: "text", key: "term", label: "Semester", placeholder: "Fall 2026", half: true },
            { kind: "number", key: "gpa", label: "GPA", step: 0.01, half: true },
            { kind: "number", key: "credits", label: "Credits (optional)", step: 0.5, half: true },
          ],
        },
        {
          kind: "text",
          key: "grade",
          label: "Final grade",
          placeholder: "4.58 / 5.00 GPA",
          help: "Only when there are no semester results above — otherwise the CGPA is calculated.",
        },
        {
          kind: "list",
          key: "courses",
          label: "Courses",
          addLabel: "Add course",
          compact: true,
          itemLabel: (c) => c.name || "New course",
          itemMeta: (c) => c.code,
          newItem: () => ({ code: "", name: "" }),
          fields: [
            { kind: "text", key: "code", label: "Code", half: true },
            { kind: "text", key: "name", label: "Name", half: true },
            { kind: "file", key: "url", label: "Course structure (PDF)", accept: "application/pdf" },
          ],
        },
        media("media", "Photos & videos", "cutout", "Shown in the details popup."),
        {
          kind: "list",
          key: "links",
          label: "Documents (PDF) & links",
          help: "Certificates, transcripts, marksheets — listed in the details popup.",
          addLabel: "Add document",
          compact: true,
          itemLabel: (d) => d.label || "New document",
          itemMeta: (d) => d.url?.split("/").pop(),
          newItem: () => ({ label: "", url: "" }),
          fields: [
            { kind: "text", key: "label", label: "Title", placeholder: "HSC certificate" },
            { kind: "file", key: "url", label: "PDF or link", accept: "application/pdf,image/*" },
          ],
        },
        { kind: "text", key: "url", label: "Website" },
      ],
    },
  },

  experience: {
    title: "Experience & leadership",
    description: "The CV-style list. Anything you add under details appears in the role's popup.",
    root: {
      kind: "list",
      key: "",
      label: "",
      addLabel: "Add role",
      itemLabel: journeyLabel,
      itemMeta: journeyMeta,
      newItem: () => ({ kind: "experience", title: "", organization: "", start: "", status: "in-progress" }),
      fields: [
        { kind: "select", key: "kind", label: "Type", options: opt([["experience", "Experience"], ["leadership", "Leadership"]]) },
        ...journeyBase,
        { kind: "textarea", key: "summary", label: "One-line summary", rows: 2 },
        {
          kind: "strings",
          key: "highlights",
          label: "Details — bullet points",
          addLabel: "Add point",
          help: "Write “Label — detail” to make the label bold.",
        },
        { kind: "textarea", key: "quote", label: "Personal reflection (quote)", rows: 3 },
        media("media", "Photos & videos", "photo", "Shown at the top of the role's popup."),
        linkList("links", "Buttons / links"),
      ],
    },
  },

  honours: {
    title: "Honours, talks & events",
    description: "Pinned items are shown first in the carousel.",
    root: {
      kind: "list",
      key: "",
      label: "",
      addLabel: "Add honour or event",
      itemLabel: journeyLabel,
      itemMeta: (i) => [i.result, i.start].filter(Boolean).join(" · "),
      pin: { key: "pinned", max: 4, label: "Pinned", note: "Pinned honours stay at the top, in this order — four fit on screen before sliding." },
      newItem: () => ({ kind: "award", title: "", organization: "", start: "", status: "completed" }),
      fields: [
        { kind: "select", key: "kind", label: "Type", half: true, options: opt([["award", "Award / programme"], ["event", "Event / talk / competition"]]) },
        { kind: "text", key: "result", label: "Badge", half: true, placeholder: "9th place, Presenter…" },
        ...journeyBase,
        { kind: "textarea", key: "summary", label: "Summary", rows: 2 },
        media("media", "Photos, certificates & videos", "photo", "Shown on the card. For a certificate, set its Fit to “Certificate — show whole”."),
        { kind: "text", key: "credentialUrl", label: "Credential verification link", half: true },
        { kind: "text", key: "url", label: "Link (card opens this)", half: true },
      ],
    },
  },

  projects: {
    title: "Projects",
    description: "Featured projects are the three big cards on the home page; the rest slide below.",
    root: {
      kind: "list",
      key: "",
      label: "",
      addLabel: "Add project",
      itemLabel: (p) => p.title || "New project",
      itemMeta: (p) => [p.category, p.year].filter(Boolean).join(" · "),
      pin: { key: "featured", max: 3, label: "Featured", note: "Up to three featured projects get the big cards, in this order — featured ones stay at the top." },
      newItem: () => ({
        slug: "",
        title: "",
        subtitle: "",
        category: "",
        status: "in-development",
        featured: false,
        year: String(new Date().getFullYear()),
        summary: "",
        problem: "",
        approach: [],
        impact: [],
        tech: [],
        links: [],
        media: [],
      }),
      fields: [
        { kind: "text", key: "title", label: "Title", half: true },
        { kind: "text", key: "slug", label: "URL slug", half: true, help: "/projects/<slug> — filled in from the title." },
        { kind: "text", key: "subtitle", label: "Subtitle" },
        { kind: "text", key: "category", label: "Category", half: true, placeholder: "AI · LLM" },
        { kind: "text", key: "year", label: "Year", half: true },
        {
          kind: "select",
          key: "status",
          label: "Status",
          half: true,
          options: opt([["live", "Live"], ["in-development", "In development"], ["completed", "Completed"], ["coursework", "Coursework"]]),
        },
        { kind: "text", key: "presentedAt", label: "Presented at", half: true },
        { kind: "textarea", key: "summary", label: "Summary", rows: 3 },
        { kind: "textarea", key: "problem", label: "The problem", rows: 3 },
        { kind: "strings", key: "approach", label: "Approach", multiline: true, addLabel: "Add step" },
        { kind: "strings", key: "impact", label: "Impact", addLabel: "Add point" },
        { kind: "strings", key: "tech", label: "Tech stack", addLabel: "Add technology" },
        { kind: "strings", key: "team", label: "Team", addLabel: "Add teammate" },
        { kind: "text", key: "note", label: "Note next to links", placeholder: "The demo's backend is currently offline." },
        linkList("links", "Links"),
        media("media", "Photos & videos", "photo", "Shown on the project card and at the top of the case study."),
      ],
    },
  },

  skills: {
    collage: { autoSizes: skillSizes, labelOf: (g) => g.title, closingCard: "Highlight card (see Settings)" },
    title: "Skills",
    description: "A collage of skill groups. The first is the big dark card; use ↑↓ to reorder.",
    root: {
      kind: "list",
      key: "",
      label: "",
      addLabel: "Add skill group",
      itemLabel: (g) => g.title || "New group",
      itemMeta: (g) =>
        [`${g.skills?.length ?? 0} skills`, g.tile && g.tile !== "auto" ? `Box: ${g.tile}` : "", g.group ? `Merged: ${g.group}` : ""]
          .filter(Boolean)
          .join(" · "),
      newItem: () => ({ id: "", title: "", description: "", skills: [] }),
      fields: [
        { kind: "text", key: "title", label: "Title", half: true },

        { kind: "textarea", key: "description", label: "Description", rows: 2 },
        { kind: "strings", key: "skills", label: "Skills", addLabel: "Add skill" },
        ...collageFields("groups"),
        { kind: "text", key: "id", label: "ID", help: "Short unique name, e.g. “ai” — it also picks the icon." },
      ],
    },
  },

  research: {
    title: "Research",
    description: "Your research statement and interests. Papers live under Publications.",
    root: {
      kind: "object",
      key: "",
      label: "",
      fields: [
        { kind: "strings", key: "statement", label: "Statement — paragraphs", multiline: true, addLabel: "Add paragraph" },
        {
          kind: "list",
          key: "interests",
          label: "Interests",
          addLabel: "Add interest",
          compact: true,
          itemLabel: (i) => i.title || "New interest",
          newItem: () => ({ title: "", description: "" }),
          fields: [
            { kind: "text", key: "title", label: "Title" },
            { kind: "textarea", key: "description", label: "Description", rows: 2 },
          ],
        },
      ],
    },
  },

  publications: {
    title: "Publications",
    description: "Papers appear in the Research section, each with its own page and BibTeX.",
    root: {
      kind: "list",
      key: "",
      label: "",
      addLabel: "Add paper",
      itemLabel: (p) => p.title || "New paper",
      itemMeta: (p) => [p.venue, p.year, p.status].filter(Boolean).join(" · "),
      newItem: () => ({ slug: "", title: "", authors: [], venue: "", year: String(new Date().getFullYear()), status: "in-preparation" }),
      fields: [
        { kind: "text", key: "title", label: "Title" },
        { kind: "strings", key: "authors", label: "Authors (in order)", addLabel: "Add author" },
        { kind: "text", key: "venue", label: "Conference / journal", half: true },
        { kind: "text", key: "year", label: "Year", half: true },
        {
          kind: "select",
          key: "status",
          label: "Status",
          half: true,
          options: opt([
            ["published", "Published"],
            ["accepted", "Accepted"],
            ["under-review", "Under review"],
            ["preprint", "Preprint"],
            ["in-preparation", "In preparation"],
          ]),
        },
        { kind: "text", key: "slug", label: "URL slug", half: true, help: "/research/<slug> — filled in from the title." },
        { kind: "textarea", key: "abstract", label: "Abstract", rows: 6 },
        { kind: "strings", key: "keywords", label: "Keywords", addLabel: "Add keyword" },
        { kind: "text", key: "doi", label: "DOI", half: true, placeholder: "10.1109/…" },
        { kind: "text", key: "url", label: "Publisher page", half: true },
        { kind: "file", key: "pdfUrl", label: "PDF", accept: "application/pdf" },
        { kind: "text", key: "codeUrl", label: "Code (GitHub)", half: true },
        { kind: "text", key: "projectSlug", label: "Related project slug", half: true },
        media("media", "Figures, poster & photos", "document", "Shown on the paper's page."),
      ],
    },
  },

  canvas: {
    title: "Canvas & Instagram",
    description: "Life outside the terminal: interests, Instagram posts and photos. Pinned posts come first — the first three are visible without sliding.",
    root: {
      kind: "object",
      key: "",
      label: "",
      fields: [
        { kind: "text", key: "instagramHandle", label: "Instagram handle", half: true },
        { kind: "text", key: "instagramUrl", label: "Instagram profile URL", half: true },
        {
          kind: "list",
          key: "instagramPosts",
          label: "Instagram posts",
          addLabel: "Add post",
          compact: true,
          itemLabel: (p) => p.url?.match(/\/(?:p|reel)\/([\w-]+)/)?.[1] ?? "New post",
          pin: { key: "pinned", max: 3, label: "Pinned", note: "Pinned posts stay at the top, in this order — the three shown before sliding." },
          newItem: () => ({ url: "", pinned: false }),
          fields: [
            { kind: "text", key: "url", label: "Post link", placeholder: "https://www.instagram.com/p/…" },
          ],
        },
        {
          kind: "list",
          key: "interests",
          label: "Interests",
          addLabel: "Add interest",
          compact: true,
          itemLabel: (i) => i.label || "New interest",
          itemMeta: (i) => i.note,
          newItem: () => ({ label: "", note: "" }),
          fields: [
            { kind: "text", key: "label", label: "Interest", half: true },
            { kind: "text", key: "note", label: "Caption", half: true },
          ],
        },
        media("gallery", "Gallery", "photo", "A photo grid under the Instagram posts."),
      ],
    },
  },

  settings: {
    title: "Settings",
    description: "Turn home-page sections on or off, and write their headings and menu labels.",
    root: {
      kind: "object",
      key: "",
      label: "",
      fields: [
        {
          kind: "object",
          key: "sections",
          label: "Home page sections",
          fields: (
            [
              ["about", "About"],
              ["journey", "Journey"],
              ["skills", "Skills"],
              ["projects", "Projects"],
              ["research", "Research"],
              ["canvas", "Canvas"],
              ["contact", "Contact"],
            ] as const
          ).map(([key, label]): Field => ({ kind: "object", key, label, fields: sectionTextFields })),
        },
        {
          kind: "text",
          key: "skillsHighlight",
          label: "Skills highlight",
          half: true,
          placeholder: "e.g. hackathon-2025",
          help: "The ID of a journey entry to feature as the last card under Skills. Leave empty for none.",
        },
        {
          kind: "boolean",
          key: "showAcademicPage",
          label: "Academic profile page",
          half: true,
          help: "A calm one-page summary at /academic — useful for graduate applications.",
        },
      ],
    },
  },
};
