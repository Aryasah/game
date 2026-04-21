"use client";

import React, { useEffect, useRef } from "react";
import { DeckExplosionVideo } from "@/components/DeckExplosionVideo";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onJoinGame: () => void;
  onCreateLobby: () => void;
}

export function LandingPage({ onJoinGame, onCreateLobby }: LandingPageProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        opacity: 0,
        y: -80,
        scale: 0.95,
        scrollTrigger: {
          trigger: '#video-scroll-zone',
          start: 'top top',
          end: '15% top',
          scrub: 1,
        }
      });
    }

    const sections = document.querySelectorAll('.journey-section');
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 40%",
            scrub: 1,
          }
        }
      );
    });

    const ctaInner = document.querySelector('#cta-inner');
    if (ctaInner) {
      gsap.fromTo(
        ctaInner,
        { y: 250, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          scrollTrigger: {
            trigger: '#parallax-reveal-zone',
            start: 'top 90%',
            end: 'top 30%',
            scrub: 1.5,
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        .theme-wrapper {
          --color-primary: #ffb3b2;
          --color-secondary: #00dbe9;
          background-color: transparent;
        }

        .glitch-text {
          position: relative;
          color: white;
        }
        .glitch-text::before, .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }
        .glitch-text::before {
          left: 2px;
          text-shadow: -1px 0 rgba(255,82,92,0.7);
          animation: glitch-anim-1 2s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px;
          text-shadow: 1px 0 rgba(0,219,233,0.7);
          animation: glitch-anim-2 3s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-anim-1 {
          0% { clip-path: inset(20% 0 80% 0); }
          20% { clip-path: inset(60% 0 10% 0); }
          40% { clip-path: inset(40% 0 50% 0); }
          60% { clip-path: inset(80% 0 5% 0); }
          80% { clip-path: inset(10% 0 70% 0); }
          100% { clip-path: inset(30% 0 40% 0); }
        }
        @keyframes glitch-anim-2 {
          0% { clip-path: inset(10% 0 60% 0); }
          20% { clip-path: inset(80% 0 5% 0); }
          40% { clip-path: inset(30% 0 20% 0); }
          60% { clip-path: inset(70% 0 15% 0); }
          80% { clip-path: inset(20% 0 50% 0); }
          100% { clip-path: inset(50% 0 30% 0); }
        }
      `}</style>

      <div className="theme-wrapper min-h-screen font-sans selection:bg-[#ff525c] selection:text-[#5b000f] text-white bg-black">

        <nav className="fixed top-0 w-full z-50 mix-blend-difference">
          <div className="flex justify-between items-center px-6 md:px-12 h-24 w-full mx-auto max-w-7xl">
            <a className="text-3xl font-black italic tracking-widest text-white glitch-text" data-text="BLUFF" href="#">
              BLUFF
            </a>
            <div className="flex items-center gap-6">
              <button onClick={onJoinGame} className="text-white font-mono text-xs tracking-[0.2em] uppercase px-6 py-3 border border-white/20 hover:bg-white hover:text-black transition-all duration-500">
                INITIALIZE
              </button>
            </div>
          </div>
        </nav>

        <DeckExplosionVideo />

        {/* Reduced to 800vh to match the 8-second video pacing */}
        {/* Change z-10 to z-40 here */}
        <div id="video-scroll-zone" className="relative z-40">

          <div ref={heroRef} className="sticky top-0 h-screen w-full flex flex-col justify-center items-center px-4 pointer-events-none">
            <div className="text-center space-y-6 max-w-5xl mx-auto mix-blend-screen">
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                DECEPTION IS <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ff525c] to-[#93000a]">ART</span>
              </h1>
              <p className="font-mono text-[#c8c6c5] max-w-2xl mx-auto uppercase tracking-[0.3em] text-sm opacity-80">
                Real-time protocol • Sub-ms latency
              </p>
            </div>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
              <span className="font-mono text-[10px] text-white tracking-[0.4em] uppercase">Scroll to Initialize</span>
              <div className="animate-bounce mt-2 text-white/70 text-2xl">↓</div>
            </div>
          </div>

          {/* Adjusted padding to distribute content cleanly over the new 800vh scroll space */}
          <div className="relative z-30 flex flex-col items-center pointer-events-none" style={{ paddingTop: '100vh' }}>
            <section className="journey-section min-h-[60vh] w-full flex items-center justify-center px-6 max-w-5xl mx-auto">
              <div className="text-center space-y-8">
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter drop-shadow-2xl">
                  Read the pattern. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00dbe9]">Break the system.</span>
                </h2>
                <p className="font-mono text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed tracking-wider">
                  Every micro-interaction tracked. Analyze betting patterns, action speed, and protocol adherence.
                </p>
              </div>
            </section>

            <section className="journey-section min-h-[60vh] w-full flex items-center justify-start px-6 md:px-24 max-w-7xl mx-auto" style={{ marginTop: '120vh' }}>
              <div className="space-y-6 max-w-xl">
                <span className="font-mono text-xs text-[#ffb3b2] tracking-[0.3em] uppercase">Neural Lobbies</span>
                <h3 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
                  Scale your <br /> complexity
                </h3>
                <p className="font-mono text-sm leading-relaxed text-white/60 tracking-wide">
                  Create private sectors or join public rings. The protocol automatically scales the deck distribution.
                </p>
              </div>
            </section>

            <section className="journey-section min-h-[60vh] w-full flex items-center justify-end px-6 md:px-24 max-w-7xl mx-auto" style={{ marginTop: '120vh' }}>
              <div className="space-y-6 max-w-xl text-right">
                <span className="font-mono text-xs text-[#00dbe9] tracking-[0.3em] uppercase">The Vault Protocol</span>
                <h3 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
                  Ascend the ranks
                </h3>
                <p className="font-mono text-sm leading-relaxed text-white/60 tracking-wide">
                  The Vault tracks total holdings and tactical superiority. Only the most deceptive survive.
                </p>
              </div>
            </section>
            {/* Added ID and restored pointer events to the buttons so they work */}
            <section id="final-cta-section" className="journey-section min-h-[60vh] w-full flex items-center justify-center px-6 md:px-24 max-w-7xl mx-auto" style={{ marginTop: '120vh', marginBottom: '20vh' }}>
              <div className="space-y-6 max-w-xl text-center pointer-events-auto">
                <span className="font-mono text-xs text-[#00dbe9] tracking-[0.3em] uppercase">Initialization</span>
                <h3 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
                  Play Your Hand
                </h3>
                <p className="font-mono text-sm leading-relaxed text-white/60 tracking-wide mb-8">
                  The Vault tracks total holdings and tactical superiority. Only the most deceptive survive.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 w-full justify-center mt-8">
                  <button
                    onClick={onCreateLobby}
                    className="bg-white text-black font-mono text-sm tracking-[0.2em] uppercase px-12 py-5 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-95 font-bold hover:bg-gray-200 cursor-pointer"
                  >
                    HOST PROTOCOL
                  </button>
                  <button
                    onClick={onJoinGame}
                    className="bg-black text-white border border-white/20 font-mono text-sm tracking-[0.2em] uppercase px-12 py-5 hover:bg-white/10 transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    JOIN NODE
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* <section
          id="parallax-reveal-zone"
          className="relative z-10 w-full min-h-10 flex flex-col justify-center items-center "
          style={{
            background: "#000000 !important"
          }}
        >

        </section> */}
      </div>
    </>
  );
}