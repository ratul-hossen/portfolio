import { ArrowUpRight } from "lucide-react";
import type { Profile, SectionText } from "@/content/types";
import { Reveal } from "@/components/ui/reveal";
import { SocialIcon } from "@/components/ui/social-icon";

export function Contact({ profile, text }: { profile: Profile; text: SectionText }) {
  const links = [
    { platform: "email" as const, label: "Email", url: `mailto:${profile.email}`, display: profile.email },
    ...profile.socials.map((social) => ({
      ...social,
      display: social.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    })),
  ];

  return (
    <section id="contact" className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="rounded-[2.5rem] bg-fg px-7 py-14 text-bg sm:px-14 sm:py-20">
          <p className="text-sm font-semibold text-bg/60">{text.eyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">{text.title}</h2>
          {text.intro ? <p className="mt-5 max-w-2xl text-lg text-bg/70">{text.intro}</p> : null}

          <ul className="mt-12 grid gap-3 sm:grid-cols-2">
            {links.map((link) => (
              <li key={link.platform}>
                <a
                  href={link.url}
                  target={link.platform === "email" ? undefined : "_blank"}
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl bg-bg/10 px-5 py-4 transition-colors hover:bg-bg/15"
                >
                  <SocialIcon platform={link.platform} className="size-5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm text-bg/60">{link.label}</span>
                    <span className="block truncate font-medium">{link.display}</span>
                  </span>
                  <ArrowUpRight className="ml-auto size-4 shrink-0 text-bg/50 transition-colors group-hover:text-bg" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
