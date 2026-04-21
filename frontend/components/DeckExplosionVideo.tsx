"use client";

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function DeckExplosionVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Use standard useEffect instead of useLayoutEffect in Next.js to avoid SSR mismatch warnings
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force video to frame 0 and pause immediately
    video.currentTime = 0;
    video.pause();

    // gsap.context() is CRITICAL for React apps. It ensures animations don't duplicate on hot-reloads.
    let ctx = gsap.context(() => {

      const initScrollTrigger = () => {
        // Fallback to 8 seconds if video metadata hasn't fully registered
        const duration = video.duration || 8;

        // 1. Create a Master Timeline for the Video Scrubbing
        const videoTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#video-scroll-zone',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5, // 1.5s smoothing for that buttery Apple feel
          }
        });

        // The Dead Zone: Do nothing for the first 15% of the timeline (Hero Text)
        videoTl.to(video, {
          currentTime: 0,
          duration: 0.15,
          ease: "none"
        });

        // The Explosion: Scrub the video to the end over the remaining 85% of the scroll
        videoTl.to(video, {
          currentTime: duration - 0.05, // Stop right before the end to avoid flickering
          duration: 0.85,
          ease: "none"
        });

        // 2. The Smoke Clearing Effect (Fade out wrapper for the CTA)
        gsap.to(wrapperRef.current, {
          opacity: 0.1,
          scrollTrigger: {
            trigger: '#final-cta-section',
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          }
        });
      };

      // Video must load metadata before we can grab its duration for the GSAP math
      if (video.readyState >= 1) {
        initScrollTrigger();
      } else {
        video.addEventListener('loadedmetadata', initScrollTrigger);
      }
    });

    // Cleanup function: destroys the GSAP context when you leave the page
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="fixed inset-0 w-full h-full z-30 pointer-events-none bg-black">
      <video
        ref={videoRef}
        src="/deck-explosion-keyframed.mp4"
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/80 to-transparent"></div>
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)]"></div>
    </div>
  );
}