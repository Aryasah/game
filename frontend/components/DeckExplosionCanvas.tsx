"use client";

import React, { useLayoutEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CARD_COUNT = 52;
const DUMMY = new THREE.Object3D();

function Scene() {
  const cardsRef = useRef<THREE.InstancedMesh>(null);
  const boxLidRef = useRef<THREE.Mesh>(null);
  const boxBaseRef = useRef<THREE.Group>(null);
  const cameraGroupRef = useRef<THREE.Group>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const texture = useTexture('/card_texture.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;

  // Generate random target positions for cards
  const targetPositions = useRef<{ pos: THREE.Vector3; rot: THREE.Euler }[]>([]);
  if (targetPositions.current.length === 0) {
    for (let i = 0; i < CARD_COUNT; i++) {
      targetPositions.current.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20 - 5
        ),
        rot: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
      });
    }
  }

  // Set initial position of all instances inside the box
  useLayoutEffect(() => {
    if (cardsRef.current) {
      for (let i = 0; i < CARD_COUNT; i++) {
        DUMMY.position.set(0, 0, 0);
        DUMMY.rotation.set(0, 0, 0);
        DUMMY.updateMatrix();
        cardsRef.current.setMatrixAt(i, DUMMY.matrix);
      }
      cardsRef.current.instanceMatrix.needsUpdate = true;
    }

    // Scroll animation logic
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#main-scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    tlRef.current = tl;

    // 0-10%: Open lid
    tl.to(
      boxLidRef.current!.rotation,
      { x: -Math.PI / 1.5, duration: 1, ease: 'power1.inOut' },
      0 // Start at 0
    );

    // 10-40%: Scatter cards and fade out box
    // To animate instances efficiently, we animate a custom proxy object
    const proxy = { progress: 0, boxOpacity: 1 };
    tl.to(
      proxy,
      {
        progress: 1,
        boxOpacity: 0,
        duration: 3,
        ease: 'power2.out',
        onUpdate: () => {
          // Update box opacity
          if (boxBaseRef.current) {
            boxBaseRef.current.children.forEach((child) => {
              if (child instanceof THREE.Mesh) {
                child.material.opacity = proxy.boxOpacity;
                child.material.transparent = true;
                child.material.needsUpdate = true;
              }
            });
          }
          if (boxLidRef.current) {
            boxLidRef.current.material.opacity = proxy.boxOpacity;
            boxLidRef.current.material.transparent = true;
            boxLidRef.current.material.needsUpdate = true;
          }

          // Update card instances
          if (cardsRef.current) {
            for (let i = 0; i < CARD_COUNT; i++) {
              const target = targetPositions.current[i];
              DUMMY.position.lerpVectors(new THREE.Vector3(0, 0, 0), target.pos, proxy.progress);
              
              // Interpolate rotation
              const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
              const q2 = new THREE.Quaternion().setFromEuler(target.rot);
              DUMMY.quaternion.slerpQuaternions(q1, q2, proxy.progress);
              
              DUMMY.updateMatrix();
              cardsRef.current.setMatrixAt(i, DUMMY.matrix);
            }
            cardsRef.current.instanceMatrix.needsUpdate = true;
          }
        },
      },
      1 // Start after lid opens (1 in relative duration of timeline)
    );

    // 40-90%: Move camera group forward through the cards
    tl.to(
      cameraGroupRef.current!.position,
      { z: -15, duration: 5, ease: 'power1.inOut' },
      4 // Start after scatter
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      <group ref={cameraGroupRef}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
      </group>

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={2} />
      <Environment preset="city" />

      {/* Deck Box Placeholder */}
      <group ref={boxBaseRef} position={[0, -0.5, 0]}>
        {/* Base of the box */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[1.6, 2.2, 0.6]} />
          <meshStandardMaterial color="#222" roughness={0.7} />
        </mesh>
      </group>
      {/* Box Lid */}
      <mesh ref={boxLidRef} position={[0, 0.6, -0.3]} rotation={[0, 0, 0]}>
        {/* Geometry shifted to hinge at top edge */}
        <group position={[0, 0.05, 0.3]}>
           <mesh position={[0, 0, 0]}>
             <boxGeometry args={[1.6, 0.1, 0.6]} />
             <meshStandardMaterial color="#333" roughness={0.7} />
           </mesh>
        </group>
      </mesh>

      {/* Cards Instanced Mesh */}
      <instancedMesh ref={cardsRef} args={[undefined, undefined, CARD_COUNT]}>
        {/* Card Dimensions standard playing card 2.5 x 3.5 inches */}
        <boxGeometry args={[1.5, 2.1, 0.02]} />
        <meshStandardMaterial map={texture} roughness={0.4} metalness={0.1} />
      </instancedMesh>
    </>
  );
}

export function DeckExplosionCanvas() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas shadows>
        <Scene />
      </Canvas>
    </div>
  );
}
