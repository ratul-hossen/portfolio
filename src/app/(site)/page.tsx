import { About } from "@/components/sections/about";
import { Canvas } from "@/components/sections/canvas";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Journey } from "@/components/sections/journey";
import { Projects } from "@/components/sections/projects";
import { Research } from "@/components/sections/research";
import { Skills } from "@/components/sections/skills";
import { getCanvas, getJourney, getProfile, getProjects, getResearch, getSettings, getSkills } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function HomePage() {
  const [profile, journey, projects, skills, research, canvas, settings] = await Promise.all([
    getProfile(),
    getJourney(),
    getProjects(),
    getSkills(),
    getResearch(),
    getCanvas(),
    getSettings(),
  ]);
  // Each section's heading text and on/off switch live under Settings in the admin panel.
  const { sections } = settings;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.headline,
    url: siteUrl,
    email: `mailto:${profile.email}`,
    sameAs: profile.socials.map((social) => social.url),
    alumniOf: journey
      .filter((item) => item.kind === "education")
      .map((item) => ({ "@type": "CollegeOrUniversity", name: item.organization })),
    knowsAbout: skills.flatMap((group) => group.skills),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero profile={profile} showAcademic={settings.showAcademicPage} />
      {sections.about.show ? (
        <About profile={profile} education={journey.filter((item) => item.kind === "education")} text={sections.about} />
      ) : null}
      {sections.journey.show ? <Journey items={journey} text={sections.journey} /> : null}
      {sections.skills.show ? (
        <Skills
          groups={skills}
          highlight={settings.skillsHighlight ? journey.find((item) => item.id === settings.skillsHighlight) : undefined}
          text={sections.skills}
        />
      ) : null}
      {sections.projects.show ? <Projects projects={projects} text={sections.projects} /> : null}
      {sections.research.show ? <Research research={research} authorName={profile.name} text={sections.research} /> : null}
      {sections.canvas.show ? <Canvas canvas={canvas} text={sections.canvas} /> : null}
      {sections.contact.show ? <Contact profile={profile} text={sections.contact} /> : null}
    </>
  );
}
