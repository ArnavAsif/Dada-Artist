'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useShowroom } from '@/context/ShowroomContext';
import { ProductHotspot } from './ProductHotspot';
import { Sparkles, Info, Maximize2 } from 'lucide-react';
import { sounds } from '@/utils/sound';

export const HeroRoom: React.FC = () => {
  const {
    products,
    heroImageUrl,
    isModalOpen,
    isReversing,
    lightingMode,
    openProduct,
    hoveredProduct,
  } = useShowroom();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Background blur and dimming when product modal opens or closes
  useEffect(() => {
    if (!stageRef.current) return;

    if (isModalOpen && !isReversing) {
      gsap.to(stageRef.current, {
        filter: 'blur(12px) brightness(0.4) contrast(0.92)',
        scale: 0.975,
        duration: 0.7,
        ease: 'power2.out',
      });
    } else if (!isModalOpen || isReversing) {
      gsap.to(stageRef.current, {
        filter: 'blur(0px) brightness(1) contrast(1)',
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }, [isModalOpen, isReversing]);

  // Subtle 3D Mouse Parallax and dynamic lighting sheen
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // quickTo for butter-smooth 60fps transform
    const rotateYTo = gsap.quickTo(stage, 'rotateY', { duration: 0.8, ease: 'power2.out' });
    const rotateXTo = gsap.quickTo(stage, 'rotateX', { duration: 0.8, ease: 'power2.out' });

    const handleMouseMove = (e: MouseEvent) => {
      // Avoid tilting heavily when modal is open
      if (isModalOpen) {
        rotateXTo(0);
        rotateYTo(0);
        return;
      }

      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const normY = (e.clientY - innerHeight / 2) / (innerHeight / 2);

      // Subtle, elegant tilt limits (max 3.2 deg)
      rotateYTo(normX * 2.8);
      rotateXTo(-normY * 2.2);

      // Calculate percentage for radial light sheen
      const pctX = Math.round((e.clientX / innerWidth) * 100);
      const pctY = Math.round((e.clientY / innerHeight) * 100);
      setMousePos({ x: pctX, y: pctY });
    };

    const handleMouseLeave = () => {
      rotateYTo(0);
      rotateXTo(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isModalOpen]);

  const toggleFullscreen = useCallback(() => {
    sounds.playSelect();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#090807] perspective-1200"
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700"
        style={{
          background: `radial-gradient(750px circle at ${mousePos.x}% ${mousePos.y}%, rgba(245, 158, 11, 0.08), transparent 70%)`,
        }}
      />

      {/* Atmospheric Ambient Lighting Overlays */}
      {lightingMode === 'ambient-evening' && (
        <div className="pointer-events-none absolute inset-0 z-15 bg-gradient-to-t from-black/60 via-amber-950/20 to-transparent mix-blend-multiply transition-opacity duration-1000" />
      )}
      {lightingMode === 'gallery-focus' && (
        <div className="pointer-events-none absolute inset-0 z-15 bg-radial from-transparent via-black/40 to-black/80 transition-opacity duration-1000" />
      )}

      {/* 3D Transform Stage Container */}
      <div
        ref={stageRef}
        className="relative transform-style-3d will-change-transform transition-shadow duration-700 shadow-2xl shadow-black"
        style={{
          // Fit perfectly within viewport while maintaining exact 1679:937 aspect ratio
          width: 'min(98vw, calc((98vh - 40px) * 1.791889))',
          height: 'min(calc(98vw / 1.791889), calc(98vh - 40px))',
          maxWidth: '1800px',
        }}
      >
        {/* Main Single Hero Image */}
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] select-none">
          <Image
            src={heroImageUrl || "/images/hero-room.png"}
            alt="FEA Atelier Living Room Product Showroom"
            fill
            priority
            sizes="(max-width: 1920px) 100vw, 1920px"
            className="object-cover object-center pointer-events-none"
          />

          {/* Depth Vignette around frame */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.45)]" />

          {/* Interactive Product Hotspots positioned exactly in % */}
          <div className="absolute inset-0 w-full h-full">
            {products.map((product) => (
              <ProductHotspot key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Minimal HUD Status Bar */}
      <div className="absolute bottom-5 left-6 right-6 md:bottom-7 md:left-12 md:right-12 z-30 flex items-center justify-between pointer-events-none">
        {/* Spatial Info Pill */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-stone-950/70 backdrop-blur-xl border border-white/10 text-[11px] text-stone-300 shadow-xl shadow-black/50">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-stone-400">SALON 01</span>
          <span className="text-white/20">•</span>
          <span className="font-light tracking-wide text-stone-200">
            {hoveredProduct ? (
              <span className="text-amber-300 font-medium">{hoveredProduct.title}</span>
            ) : (
              'Interact with any illuminated artifact to lift into 3D view'
            )}
          </span>
        </div>

        {/* Right Tools: Fullscreen & Quick Carousel Peek */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            onMouseEnter={() => sounds.playHover()}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Immersive Fullscreen'}
            className="p-2 rounded-full bg-stone-950/70 backdrop-blur-md border border-white/10 text-stone-400 hover:text-white hover:border-amber-400/40 transition-colors shadow-lg"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
