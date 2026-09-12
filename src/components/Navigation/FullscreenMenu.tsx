'use client';

import React, { useEffect, useRef } from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import gsap from 'gsap';
import { X, ArrowUpRight, Compass, Sparkles, Clock } from 'lucide-react';
import { sounds } from '@/utils/sound';

export const FullscreenMenu: React.FC = () => {
  const { isMenuOpen, closeMenu } = useShowroom();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLAnchorElement[]>([]);
  const sideInfoRef = useRef<HTMLDivElement>(null);

  // GSAP open / close animations
  useEffect(() => {
    if (!overlayRef.current) return;

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.5,
        ease: 'power2.out',
      });

      if (contentRef.current) {
        tl.fromTo(
          contentRef.current,
          { scale: 0.96, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.3'
        );
      }

      if (itemsRef.current.length > 0) {
        tl.fromTo(
          itemsRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.07,
            duration: 0.55,
            ease: 'power3.out',
          },
          '-=0.4'
        );
      }

      if (sideInfoRef.current) {
        tl.fromTo(
          sideInfoRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.4'
        );
      }
    } else {
      document.body.style.overflow = '';
      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.4,
        ease: 'power2.in',
      });
    }
  }, [isMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  const menuLinks = [
    { number: '01', title: 'Spatial Showroom', tag: 'Interactive 3D Interior', action: () => closeMenu() },
    { number: '02', title: 'Curated Collection', tag: 'Handcrafted Heritage Pieces', action: () => closeMenu() },
    { number: '03', title: 'Atelier Craftsmanship', tag: 'Belgian Linen & Florentine Plaster', action: () => closeMenu() },
    { number: '04', title: 'Bespoke Architecture', tag: 'Interior Design Commissions', action: () => closeMenu() },
    { number: '05', title: 'Private Concierge', tag: 'White-Glove Consultation', action: () => closeMenu() },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 opacity-0 pointer-events-none bg-black/85 backdrop-blur-3xl flex items-center justify-center p-6 md:p-16 transition-opacity duration-300 select-none"
      onClick={(e) => {
        if (e.target === overlayRef.current) closeMenu();
      }}
    >
      {/* Top Bar inside Menu */}
      <div className="absolute top-6 left-6 right-6 md:top-10 md:left-14 md:right-14 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <Compass size={16} className="text-amber-400/80 animate-spin-slow" />
          <span className="text-[11px] tracking-[0.25em] text-stone-300 uppercase font-light">
            Fea Atelier — Navigation
          </span>
        </div>

        <button
          onClick={closeMenu}
          onMouseEnter={() => sounds.playHover()}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-amber-400/50 text-stone-300 hover:text-white transition-all duration-300 group"
          aria-label="Close navigation overlay"
        >
          <span className="text-xs tracking-widest uppercase font-medium">Close</span>
          <X size={15} className="group-hover:rotate-90 transition-transform duration-300 text-amber-300" />
        </button>
      </div>

      {/* Main Content Grid */}
      <div
        ref={contentRef}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center my-auto pt-12 lg:pt-0"
      >
        {/* Left Column: Nav Links */}
        <div className="lg:col-span-7 flex flex-col gap-5 md:gap-7">
          <div className="text-[10px] tracking-[0.3em] uppercase text-amber-400/70 font-semibold mb-1 flex items-center gap-2">
            <Sparkles size={12} />
            <span>Exploration Manifest</span>
          </div>

          {menuLinks.map((item, idx) => (
            <a
              key={item.number}
              ref={(el) => {
                if (el) itemsRef.current[idx] = el;
              }}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                item.action();
              }}
              onMouseEnter={() => sounds.playHover()}
              className="group flex items-baseline justify-between py-2 border-b border-white/10 hover:border-amber-400/40 transition-colors duration-300"
            >
              <div className="flex items-baseline gap-4 md:gap-6">
                <span className="text-xs md:text-sm font-mono text-stone-500 group-hover:text-amber-300 transition-colors">
                  {item.number}
                </span>
                <span className="text-2xl md:text-4xl lg:text-5xl font-light tracking-tight text-stone-200 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                  {item.title}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-stone-400 group-hover:text-amber-200 transition-colors">
                <span className="text-xs tracking-wider font-light">{item.tag}</span>
                <ArrowUpRight
                  size={16}
                  className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
                />
              </div>
            </a>
          ))}
        </div>

        {/* Right Column: Global Ateliers & Spatial Notes */}
        <div
          ref={sideInfoRef}
          className="lg:col-span-5 flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-stone-900/40 border border-white/10 backdrop-blur-md"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-amber-400/80 font-semibold mb-4">
              <Clock size={12} />
              <span>International Ateliers</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="font-medium text-stone-200">Paris VIII</div>
                <div className="text-[10px] text-stone-400 font-light mt-0.5">Place Vendôme • CET</div>
                <div className="text-[10px] text-amber-400/80 mt-2 font-mono">10:00 — 19:00</div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="font-medium text-stone-200">Milano</div>
                <div className="text-[10px] text-stone-400 font-light mt-0.5">Via Montenapoleone • CET</div>
                <div className="text-[10px] text-amber-400/80 mt-2 font-mono">10:00 — 19:30</div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="font-medium text-stone-200">New York</div>
                <div className="text-[10px] text-stone-400 font-light mt-0.5">Tribeca Lofts • EST</div>
                <div className="text-[10px] text-amber-400/80 mt-2 font-mono">11:00 — 18:00</div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="font-medium text-stone-200">Tokyo</div>
                <div className="text-[10px] text-stone-400 font-light mt-0.5">Ginza Chuo-ku • JST</div>
                <div className="text-[10px] text-amber-400/80 mt-2 font-mono">11:00 — 20:00</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-[11px] text-stone-400 leading-relaxed">
              Every object displayed in this spatial gallery is handcrafted to bespoke architectural standards.
              Inquiries for customized wood finishes or upholstery textiles are welcomed.
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span>FEA ARCHITECTURAL ATELIER</span>
              <span>© 2026 EDITION</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
