"use client";

import { useEffect, useRef } from "react";

/**
 * A muted, looping video that plays only while it is on screen and pauses
 * when scrolled away. Browsers only allow autoplay without sound, so audio
 * stays off until the viewer turns it on with the controls.
 */
export function AutoplayVideo({
  src,
  poster,
  className,
  label,
}: {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={video}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      aria-label={label}
      className={className}
    />
  );
}

/** YouTube embed that autoplays muted and loops, loaded only when on screen. */
export function youtubeAutoplayUrl(url: string) {
  const id = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1];
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&rel=0`;
}

/**
 * Any site video: YouTube links become a muted, looping embed that starts
 * when scrolled into view; uploaded files use <AutoplayVideo>.
 */
export function SiteVideo({ url, title, className }: { url: string; title: string; className?: string }) {
  const youtube = youtubeAutoplayUrl(url);
  if (!youtube) return <AutoplayVideo src={url} label={title} className={className} />;
  return <LazyYouTube src={youtube} title={title} className={className} />;
}

function LazyYouTube({ src, title, className }: { src: string; title: string; className?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);

  // Start the embed (and so its autoplay) only once it scrolls into view.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !el.src) {
          el.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <iframe
      ref={frame}
      title={title}
      className={className}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  );
}
