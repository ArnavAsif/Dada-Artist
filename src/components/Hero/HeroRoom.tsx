'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useShowroom } from '@/context/ShowroomContext';
import { ProductHotspot } from './ProductHotspot';
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { sounds } from '@/utils/sound';

export const HeroRoom: React.FC = () => {
  const {
    products,
    heroImageUrl,
    isModalOpen,
    isReversing,
    lightingMode,
    hoveredProduct,
  } = useShowroom();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mobile horizontal scroll tracking and swipe gesture states
  const [scrollProgress, setScrollProgress] = useState(0); // 0 (left) to 1 (right)
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Touch swipe gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  // Mouse drag tracking (for testing on desktop/touch-laptop)
  const isMouseDown = useRef(false);
  const mouseStartX = useRef(0);
  const mouseScrollLeft = useRef(0);

  // Ensure stage starts all the way to the left on mobile
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, []);

  // Hide swipe hint automatically after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

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

  // Subtle 3D Mouse Parallax and dynamic lighting sheen (Desktop)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // quickTo for butter-smooth 60fps transform (use rotationY/rotationX which are GSAP's internal transform properties)
    const rotateYTo = gsap.quickTo(stage, 'rotationY', { duration: 0.8, ease: 'power2.out' });
    const rotateXTo = gsap.quickTo(stage, 'rotationX', { duration: 0.8, ease: 'power2.out' });

    const handleMouseMove = (e: MouseEvent) => {
      // Avoid tilting heavily when modal is open or on mobile
      if (isModalOpen || window.innerWidth < 768) {
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

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      setIsAtStart(true);
      setIsAtEnd(true);
      return;
    }
    const current = el.scrollLeft;
    const progress = Math.min(1, Math.max(0, current / maxScroll));
    setScrollProgress(progress);
    setIsAtStart(current < 20);
    setIsAtEnd(current > maxScroll - 20);
    setHasInteracted(true);
  }, []);

  // Update scroll metrics on window resize
  useEffect(() => {
    const onResize = () => {
      handleScroll();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [handleScroll]);

  const scrollToPosition = useCallback((targetRatio: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    sounds.playSelect();
    setHasInteracted(true);
    el.scrollTo({
      left: maxScroll * targetRatio,
      behavior: 'smooth',
    });
  }, []);

  const scrollToLeft = useCallback(() => {
    scrollToPosition(0);
  }, [scrollToPosition]);

  const scrollToRight = useCallback(() => {
    scrollToPosition(1);
  }, [scrollToPosition]);

  const scrollToCenter = useCallback(() => {
    scrollToPosition(0.5);
  }, [scrollToPosition]);

  // Touch swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartTime.current = Date.now();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - touchStartX.current;
    const elapsed = Date.now() - touchStartTime.current;
    touchStartX.current = null;

    // Detect intentional quick swipe (under 450ms and > 40px)
    if (elapsed < 450 && Math.abs(deltaX) > 40) {
      const el = scrollContainerRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      setHasInteracted(true);

      // Swiping finger to the left (deltaX < 0) -> move toward right side of showroom
      if (deltaX < 0) {
        if (el.scrollLeft < maxScroll * 0.35) {
          scrollToCenter();
        } else {
          scrollToRight();
        }
      }
      // Swiping finger to the right (deltaX > 0) -> move toward left side (or explore right if at start)
      else if (deltaX > 0) {
        if (el.scrollLeft < 30) {
          // If already at extreme left, swipe right navigates to right side
          scrollToRight();
        } else if (el.scrollLeft > maxScroll * 0.65) {
          scrollToCenter();
        } else {
          scrollToLeft();
        }
      }
    }
  };

  // Mouse drag support for desktop/testing
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    isMouseDown.current = true;
    mouseStartX.current = e.pageX - el.offsetLeft;
    mouseScrollLeft.current = el.scrollLeft;
  };

  const handleMouseMoveDrag = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - mouseStartX.current) * 1.4;
    el.scrollLeft = mouseScrollLeft.current - walk;
    setHasInteracted(true);
  };

  const handleMouseUpDrag = () => {
    isMouseDown.current = false;
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen h-[100dvh] min-h-0 md:min-h-[600px] flex items-center justify-center overflow-hidden bg-[#090807] md:perspective-1200"
    >
      {/* Dynamic Cursor Spotlight Overlay (Desktop) */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 hidden md:block"
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

      {/* Floating Swipe Cue on Mobile (Fades out after first interaction or timer) */}
      <div
        className={`pointer-events-none md:hidden absolute top-20 left-1/2 -translate-x-1/2 z-30 transition-all duration-700 ease-out ${
          showSwipeHint && !hasInteracted && isAtStart
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-950/85 backdrop-blur-md border border-amber-400/30 text-[11px] text-amber-200/90 shadow-2xl">
          <span className="text-amber-400 text-xs">↔</span>
          <span>Swipe horizontally to explore room</span>
        </div>
      </div>

      {/* Main Horizontal Scroll / Pan Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveDrag}
        onMouseUp={handleMouseUpDrag}
        onMouseLeave={handleMouseUpDrag}
        className={`showroom-stage-container w-full h-full overflow-x-auto overflow-y-hidden md:overflow-hidden select-none touch-pan-x overscroll-x-contain no-scrollbar flex items-center justify-start md:justify-center ${
          isModalOpen ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        {/* 3D Transform Stage Container */}
        <div
          ref={stageRef}
          className="showroom-stage relative transform-style-3d will-change-transform transition-shadow duration-700 shadow-2xl shadow-black shrink-0"
        >
          {/* Main Single Hero Image */}
          <div className="relative w-full h-full rounded-none md:rounded-xl overflow-hidden shadow-2xl border-0 md:border md:border-white/[0.08] select-none">
            <Image
              src={heroImageUrl || "/images/hero-room.png"}
              alt="FEA Atelier Living Room Product Showroom"
              fill
              priority
              sizes="(max-width: 768px) 1800px, (max-width: 1920px) 100vw, 1920px"
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
      </div>

      {/* Bottom Minimal HUD Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 md:bottom-7 md:left-12 md:right-12 z-30 flex items-center justify-between pointer-events-none">
        {/* Spatial Info Pill */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-1.5 rounded-full bg-stone-950/80 backdrop-blur-xl border border-white/10 text-[11px] text-stone-300 shadow-xl shadow-black/50">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="font-mono text-stone-400 shrink-0">
            {scrollProgress < 0.33 ? 'SALON WEST' : scrollProgress > 0.66 ? 'SALON EAST' : 'SALON CENTER'}
          </span>
          <span className="text-white/20">•</span>
          <span className="font-light tracking-wide text-stone-200 truncate max-w-[170px] sm:max-w-none">
            {hoveredProduct ? (
              <span className="text-amber-300 font-medium">{hoveredProduct.title}</span>
            ) : (
              <>
                <span className="hidden sm:inline">Interact with any illuminated artifact to lift into 3D view</span>
                <span className="inline sm:hidden">Tap artifact to inspect</span>
              </>
            )}
          </span>
        </div>

        {/* Mobile Navigation Glide Controls */}
        <div className="pointer-events-auto flex md:hidden items-center gap-1 bg-stone-950/80 backdrop-blur-xl px-2 py-1 rounded-full border border-white/10 shadow-xl shadow-black/50">
          <button
            onClick={scrollToLeft}
            disabled={isAtStart}
            aria-label="View Left Room"
            className={`p-1 rounded-full transition-colors ${
              isAtStart ? 'text-stone-600 opacity-40' : 'text-amber-300 active:scale-95'
            }`}
          >
            <ChevronLeft size={15} />
          </button>

          <div className="flex items-center gap-1 px-1">
            <button
              onClick={() => scrollToPosition(0)}
              aria-label="Salon West"
              className={`h-1.5 rounded-full transition-all duration-300 ${
                scrollProgress < 0.33 ? 'w-3.5 bg-amber-400' : 'w-1.5 bg-stone-600'
              }`}
            />
            <button
              onClick={() => scrollToPosition(0.5)}
              aria-label="Salon Center"
              className={`h-1.5 rounded-full transition-all duration-300 ${
                scrollProgress >= 0.33 && scrollProgress <= 0.66 ? 'w-3.5 bg-amber-400' : 'w-1.5 bg-stone-600'
              }`}
            />
            <button
              onClick={() => scrollToPosition(1)}
              aria-label="Salon East"
              className={`h-1.5 rounded-full transition-all duration-300 ${
                scrollProgress > 0.66 ? 'w-3.5 bg-amber-400' : 'w-1.5 bg-stone-600'
              }`}
            />
          </div>

          <button
            onClick={scrollToRight}
            disabled={isAtEnd}
            aria-label="View Right Room"
            className={`p-1 rounded-full transition-colors ${
              isAtEnd ? 'text-stone-600 opacity-40' : 'text-amber-300 active:scale-95'
            }`}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Right Tools: Fullscreen (Desktop) */}
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

