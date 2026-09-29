import type { TileSize } from "@/lib/collage";

// Content model for the portfolio, stored in src/content/site.json.
// The admin panel edits it; keep fields flat and serialisable.

export type SocialPlatform =
  | "github"
  | "linkedin"
  | "instagram"
  | "email"
  | "whatsapp"
  | "website"
  | "blog";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  url: string;
};

export type Language = {
  name: string;
  level: string; // e.g. "Native", "B2 (CEFR)", "IELTS 7.0"
};

export type RouteStop = {
  place: string;
  detail: string;
  state: "past" | "now" | "next";
};

export type Profile = {
  name: string;
  shortName: string;
  headline: string;
  tagline: string;
  /** Short "right now" line shown in the hero status pill. */
  currentStatus: string;
  /** Optional source shown under that line, e.g. "— Al-Quran 39:53". */
  currentStatusSource?: string;
  location: string;
  /** Hero portrait: one photo, or several that rotate. */
  portrait: MediaItem[];
  cvUrl?: string | null;
  email: string;
  /** WhatsApp username, shown only in the footer. */
  whatsapp?: string;
  about: string[];
  languages: Language[];
  /** The "global journey" shown in About: where I've been and where I'm heading. */
  route: RouteStop[];
  socials: SocialLink[];
};

export type Course = {
  code: string;
  name: string;
  /** Course structure / syllabus document. */
  url?: string;
};

export type GradeRecord = {
  term: string;
  gpa: number;
  /** Credits taken that term; when every term has it, CGPA is credit-weighted. */
  credits?: number;
};

export type JourneyKind =
  | "education"
  | "experience"
  | "leadership"
  | "award" // honours, programmes, rankings
  | "event"; // conferences, presentations, hackathons

export type JourneyStatus = "completed" | "in-progress" | "upcoming";

export type JourneyItem = {
  id: string;
  kind: JourneyKind;
  title: string;
  organization: string;
  location?: string;
  start: string; // "Jan 2025"
  end?: string; // omitted = "Present"
  status?: JourneyStatus;
  summary?: string;
  highlights?: string[];
  /** Photos and videos: shown on the card and in the details sheet, rotating when there are several. */
  media?: MediaItem[];
  /** A short personal reflection, shown as a quote. */
  quote?: string;
  /** Short label for honours & events, e.g. "9th place", "Presenter". */
  result?: string;
  /** Education only: headline grade, e.g. "4.58 / 5.00 GPA". Computed from `grades` when those exist. */
  grade?: string;
  /** Education only: per-term grades that drive the trend chart. */
  grades?: GradeRecord[];
  /** Education only: courses taken, optionally linking to a syllabus PDF. */
  courses?: Course[];
  url?: string;
  /** Link to an online certificate / credential verification page. */
  credentialUrl?: string;
  /** Honours & events: pinned items are shown first. */
  pinned?: boolean;
  /** Education: box size in the collage ("auto" or unset = automatic). */
  tile?: TileSize | "auto";
  /** Education: entries with the same group name share one rotating box. */
  group?: string;
  /** Extra links shown in the details sheet (e.g. a project or live app). */
  links?: { label: string; url: string }[];
};

export type ProjectLink = {
  label: string;
  url: string;
};

/** How a photo sits in its frame. */
export type MediaStyle =
  | "photo" // fills the frame
  | "document" // certificate or scan, shown whole
  | "cutout"; // transparent-background portrait, anchored to the bottom

export type MediaItem = {
  type: "image" | "video";
  /** Uploaded file, or a YouTube link for videos. */
  url: string;
  caption?: string;
  /** Describes the photo for screen readers. */
  alt?: string;
  style?: MediaStyle;
};

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  category: string; // e.g. "AI · LLM", "Mobile"
  status: "live" | "in-development" | "completed" | "coursework";
  featured: boolean;
  /** Collaborators, shown as "Built with …". */
  team?: string[];
  /** Where the work was presented or submitted. */
  presentedAt?: string;
  /** Short caveat shown next to the links, e.g. a demo being offline. */
  note?: string;
  year: string;
  summary: string;
  problem: string;
  approach: string[];
  impact: string[];
  tech: string[];
  links: ProjectLink[];
  media: MediaItem[];
};

export type SkillGroup = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  /** Box size in the collage ("auto" or unset = automatic). */
  tile?: TileSize | "auto";
  /** Groups with the same name share one rotating box. */
  group?: string;
};

export type ResearchInterest = {
  title: string;
  description: string;
};

export type PublicationStatus = "published" | "accepted" | "under-review" | "preprint" | "in-preparation";

export type Publication = {
  slug: string;
  title: string;
  authors: string[];
  venue: string; // conference or journal
  year: string;
  status: PublicationStatus;
  abstract?: string;
  keywords?: string[];
  doi?: string;
  url?: string; // publisher / IEEE Xplore page
  pdfUrl?: string;
  codeUrl?: string;
  /** Related project on this site, by slug. */
  projectSlug?: string;
  /** Figures, posters or photos from the presentation. */
  media?: MediaItem[];
};

export type Research = {
  statement: string[];
  interests: ResearchInterest[];
  publications: Publication[];
};

export type InstagramPost = {
  url: string;
  /** Pinned posts are shown first (the first three are visible without sliding). */
  pinned?: boolean;
};

export type Canvas = {
  instagramHandle: string;
  instagramUrl: string;
  interests: { label: string; note: string }[];
  /** Public Instagram posts shown as embeds; pinned ones come first. */
  instagramPosts: InstagramPost[];
  gallery: MediaItem[];
};

export type PageSectionId = "about" | "journey" | "skills" | "projects" | "research" | "canvas" | "contact";

/** The heading block of one home-page section, and whether it's shown. */
export type SectionText = {
  show: boolean;
  /** Link text in the top menu; leave empty to keep the section out of the menu. */
  navLabel?: string;
  eyebrow: string;
  title: string;
  intro?: string;
};

export type SiteSettings = {
  sections: Record<PageSectionId, SectionText>;
  /** ID of a journey entry shown as a highlight card at the end of Skills. */
  skillsHighlight?: string;
  /** The one-page /academic profile (handy for graduate applications). */
  showAcademicPage: boolean;
};

/** Everything on the site, as stored in site.json. */
export type SiteContent = {
  profile: Profile;
  journey: JourneyItem[];
  projects: Project[];
  skills: SkillGroup[];
  research: Research;
  canvas: Canvas;
  settings: SiteSettings;
};
