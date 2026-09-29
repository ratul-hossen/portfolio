"use client";

import Script from "next/script";
import { useEffect } from "react";
import type { InstagramPost } from "@/content/types";
import { Carousel } from "@/components/ui/carousel";
import { SocialIcon } from "@/components/ui/social-icon";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/**
 * Public Instagram posts via Instagram's official embed script. Embeds come
 * in different heights (reels, carousels, portrait photos), so every card is
 * a fixed 4:5 frame: the post sits at the top and anything taller is faded
 * out, with a link to view it on Instagram.
 */
export function InstagramEmbeds({ posts }: { posts: InstagramPost[] }) {
  // Pinned posts first, otherwise keep the given order.
  const ordered = [...posts.filter((post) => post.pinned), ...posts.filter((post) => !post.pinned)];

  // When navigating back to the page the script is already loaded, so re-run it.
  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, [posts]);

  return (
    <>
      <Carousel
        label="Instagram posts"
        heading={<h3 className="text-sm font-semibold text-muted">Recent moments on Instagram</h3>}
        itemClassName="w-[85%] sm:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]"
        bleed={false}
      >
        {ordered.map(({ url }) => (
          // Instagram's script swaps the blockquote for an iframe; the wrapper stays React's.
          <div key={url} className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-white">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{
                margin: 0,
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
                border: 0,
                borderRadius: 0,
                boxShadow: "none",
              }}
            >
              <a href={url} target="_blank" rel="noreferrer" className="block p-6 text-sm font-medium text-[#0071e3]">
                View this post on Instagram
              </a>
            </blockquote>
            {/* Uniform footer over whatever part of the embed runs past the frame. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end justify-center bg-gradient-to-t from-white via-white/90 to-transparent pb-3">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-3.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-85"
              >
                <SocialIcon platform="instagram" className="size-4" /> View on Instagram
              </a>
            </div>
          </div>
        ))}
      </Carousel>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => window.instgrm?.Embeds.process()}
      />
    </>
  );
}
