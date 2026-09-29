import type { Profile } from "@/content/types";
import { SocialIcon } from "@/components/ui/social-icon";
import { WhatsAppButton } from "./whatsapp-button";

const iconClass = "grid size-9 place-items-center rounded-full transition-colors hover:bg-surface-2 hover:text-fg";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t border-line px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with Next.js.
        </p>
        <div className="flex items-center gap-1">
          {profile.socials.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              title={social.label}
              className={iconClass}
            >
              <SocialIcon platform={social.platform} />
            </a>
          ))}
          <a href={`mailto:${profile.email}`} aria-label="Email" title={profile.email} className={iconClass}>
            <SocialIcon platform="email" />
          </a>
          {profile.whatsapp ? <WhatsAppButton handle={profile.whatsapp} className={iconClass} /> : null}
        </div>
      </div>
    </footer>
  );
}
