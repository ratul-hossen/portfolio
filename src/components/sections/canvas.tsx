import Image from "next/image";
import { BookOpen, Crown, Feather, Plane, Sparkles } from "lucide-react";
import type { Canvas as CanvasData, SectionText } from "@/content/types";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SocialIcon } from "@/components/ui/social-icon";
import { SiteVideo } from "@/components/ui/autoplay-video";
import { InstagramEmbeds } from "./instagram-embeds";

const interestIcons: Record<string, typeof BookOpen> = {
  Reading: BookOpen,
  Chess: Crown,
  Traveling: Plane,
  Poetry: Feather,
};

export function Canvas({ canvas, text }: { canvas: CanvasData; text: SectionText }) {
  return (
    <Section id="canvas" text={text}>
      {/* One compact row: Instagram profile, then interests. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
        <Reveal className="col-span-2 min-w-0 sm:col-span-3 lg:col-span-1">
          <a
            href={canvas.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative flex h-full items-center gap-4 overflow-hidden rounded-2xl p-5 text-white"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] transition-transform duration-700 group-hover:scale-105"
            />
            <SocialIcon platform="instagram" className="relative size-8 shrink-0" />
            <div className="relative min-w-0">
              <p className="text-xs font-medium text-white/80">Follow along</p>
              <p className="truncate text-lg font-semibold tracking-tight">{canvas.instagramHandle}</p>
            </div>
            <span
              aria-hidden
              className="relative ml-auto text-white/80 transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
        </Reveal>

        {canvas.interests.map((interest, index) => {
          const Icon = interestIcons[interest.label] ?? Sparkles;
          return (
            <Reveal
              key={interest.label}
              delay={index * 0.05}
              className="flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-surface p-4"
            >
              <Icon className="size-5 shrink-0 text-accent" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{interest.label}</p>
                <p className="line-clamp-2 text-xs text-muted">{interest.note}</p>
              </div>
            </Reveal>
          );
        })}
      </div>

      {canvas.instagramPosts.length ? (
        <Reveal className="mt-8">
          <InstagramEmbeds posts={canvas.instagramPosts} />
        </Reveal>
      ) : null}

      {canvas.gallery.length ? (
        <div className="mt-4 columns-2 gap-4 sm:columns-3">
          {canvas.gallery.map((item) => (
            <Reveal key={item.url} className="mb-4 break-inside-avoid">
              <figure className="overflow-hidden rounded-3xl border border-line bg-surface">
                {item.type === "video" ? (
                  <SiteVideo
                    url={item.url}
                    title={item.caption ?? "Video"}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <Image src={item.url} alt={item.caption ?? ""} width={800} height={800} className="h-auto w-full" />
                )}
                {item.caption ? <figcaption className="px-4 py-3 text-sm text-muted">{item.caption}</figcaption> : null}
              </figure>
            </Reveal>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
