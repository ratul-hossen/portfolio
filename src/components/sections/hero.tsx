import { ArrowDown, ArrowUpRight, FileText } from "lucide-react";
import type { Profile } from "@/content/types";
import { ButtonLink } from "@/components/ui/button";
import { MediaRotator } from "@/components/ui/media-rotator";
import { Reveal } from "@/components/ui/reveal";

const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

export function Hero({ profile, showAcademic }: { profile: Profile; showAcademic: boolean }) {
  const initials = profile.name
    .split(" ")
    .filter((part) => part.length > 2)
    .map((part) => part[0])
    .join("");

  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-44">
      {/* Soft accent glow behind the hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col-reverse items-start gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <Reveal>
              {isArabic(profile.currentStatus) ? (
                // Arabic (e.g. an ayah): right-to-left, in a Qur'anic font.
                <p
                  lang="ar"
                  dir="rtl"
                  className="mb-7 max-w-2xl rounded-2xl border border-line bg-surface px-5 py-3 font-quran text-xl leading-[2.1] text-fg/85 sm:text-2xl sm:leading-[2.1]"
                >
                  {profile.currentStatus}
                  {profile.currentStatusSource ? (
                    <span dir="ltr" lang="en" className="mt-1 block text-left font-sans text-sm leading-normal text-muted">
                      {profile.currentStatusSource}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-muted">
                  <span className="size-2 rounded-full bg-success" />
                  {profile.currentStatus}
                  {profile.currentStatusSource ? <span className="text-subtle">{profile.currentStatusSource}</span> : null}
                </p>
              )}
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-7xl">{profile.name}</h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-2xl font-medium tracking-tight text-muted sm:text-3xl">{profile.headline}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{profile.tagline}</p>
            </Reveal>
            <Reveal delay={0.2} className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/#projects">
                View my work <ArrowDown className="size-4" />
              </ButtonLink>
              {profile.cvUrl ? (
                <ButtonLink href={profile.cvUrl} variant="secondary" external>
                  <FileText className="size-4" /> Download CV
                </ButtonLink>
              ) : null}
              {showAcademic ? (
                <ButtonLink href="/academic" variant="ghost">
                  Academic profile <ArrowUpRight className="size-4" />
                </ButtonLink>
              ) : null}
            </Reveal>
          </div>

          <Reveal
            delay={0.1}
            className="w-full max-w-80 shrink-0 self-center sm:max-w-96 lg:max-w-[30rem] lg:self-auto"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-accent/20 via-accent/5 to-surface-2">
              {profile.portrait?.length ? (
                <MediaRotator
                  items={profile.portrait}
                  alt={profile.name}
                  sizes="(min-width: 1024px) 480px, 384px"
                  fallbackStyle="cutout"
                  priority
                  className="size-full"
                />
              ) : (
                <div className="grid size-full place-items-center">
                  <span className="text-6xl font-semibold tracking-tight text-accent sm:text-7xl">{initials}</span>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
