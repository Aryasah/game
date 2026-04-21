"use client";

import React, { useRef, useLayoutEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function Card() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load textures
  const [cardBack, queenHearts, twoClubs] = useTexture([
    '/textures/card_back.png',
    '/textures/queen_hearts.png',
    '/textures/two_clubs.png'
  ]);
  
  // We need to swap the front texture dynamically
  const [frontTexture, setFrontTexture] = useState(queenHearts);

  // Setup GSAP animation tied to scroll
  useLayoutEffect(() => {
    if (!groupRef.current) return;
    
    const ctx = gsap.context(() => {
      // Create a scrubbed animation for the rotation
      gsap.to(groupRef?.current?.rotation, {
        y: Math.PI * 2,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero-section",
          start: "top top",
          end: "+=150%", // Scroll 1.5x screen height to complete
          scrub: true,
          pin: true, // Pin the section while scrolling
        }
      });
    });

    return () => ctx.revert();
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    
    // Texture swapping logic
    // The rotation.y goes from 0 to 2*PI.
    // Between PI/2 (90 deg) and 3*PI/2 (270 deg), the back is facing the camera.
    // If it crosses PI/2, we swap to the two_clubs so when it comes back around, it's the two!
    const normalizedRotation = groupRef.current.rotation.y % (Math.PI * 2);
    if (normalizedRotation > Math.PI / 2 && frontTexture === queenHearts) {
      setFrontTexture(twoClubs);
    } else if (normalizedRotation < Math.PI / 2 && frontTexture === twoClubs) {
      setFrontTexture(queenHearts); // Swap back if they scroll up
    }
  });

  return (
    <group ref={groupRef}>
      {/* Front Face (Positive Z) */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.5, 3.5]} />
        <meshStandardMaterial map={frontTexture} side={THREE.FrontSide} roughness={0.4} />
      </mesh>
      
      {/* Back Face (Negative Z) */}
      <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.5, 3.5]} />
        <meshStandardMaterial map={cardBack} side={THREE.FrontSide} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Wrapper for the floating animation so it doesn't conflict with GSAP rotation
function FloatingCard() {
  const floatRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!floatRef.current) return;
    const t = state.clock.getElapsedTime();
    floatRef.current.position.y = Math.sin(t * 1.5) * 0.1;
    floatRef.current.rotation.x = Math.sin(t * 0.5) * 0.05;
    floatRef.current.rotation.z = Math.sin(t * 0.8) * 0.02;
  });

  return (
    <group ref={floatRef}>
      <Card />
    </group>
  );
}

export function LieRevealedHero() {
  const textRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Text fade in animation
      // We want it to fade in when the card starts revealing the front again (around 75% of the scroll)
      gsap.to(textRef.current, {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#hero-section",
          start: "top -50%", // Start fading in midway through the pinned section
          end: "top -100%", 
          scrub: true,
        }
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="hero-section" className="relative w-full h-screen bg-stone-900 overflow-hidden flex items-center justify-center">
      
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-950 z-10 pointer-events-none" />

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-5, -5, -5]} intensity={1} color="#d4a843" />
          
          <Suspense fallback={null}>
            <FloatingCard />
          </Suspense>
        </Canvas>
      </div>

      {/* Text Overlay */}
      <div className="absolute bottom-20 z-20 flex flex-col items-center pointer-events-none">
        <h2 
          ref={textRef} 
          className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 opacity-0 translate-y-10"
        >
          Are they really playing a Queen?
        </h2>
        
        {/* Scroll indicator */}
        <div className="mt-12 animate-bounce opacity-50">
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
