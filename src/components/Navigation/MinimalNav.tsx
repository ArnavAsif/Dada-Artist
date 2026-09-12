'use client';

import React from 'react';
import { useShowroom } from '@/context/ShowroomContext';
import { ShoppingBag, Volume2, VolumeX, SunMedium, Moon, Eye, EyeOff } from 'lucide-react';
import { sounds } from '@/utils/sound';

export const MinimalNav: React.FC = () => {
  const {
    products,
    isMenuOpen,
    toggleMenu,
    totalCartItems,
    openCart,
    soundEnabled,
    toggleSound,
    lightingMode,
    cycleLightingMode,
    hotspotsVisible,
    toggleHotspotsVisible,
  } = useShowroom();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-5 py-4 md:px-10 md:py-6 flex items-center justify-between pointer-events-none transition-all duration-500">
      {/* Brand Monogram */}
      <div className="pointer-events-auto flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="w-8 h-8 rounded-full border border-amber-400/30 flex items-center justify-center bg-stone-950/60 backdrop-blur-md transition-transform duration-300 group-hover:scale-105 group-hover:border-amber-400/70 shadow-lg shadow-black/40">
          <span className="text-[11px] font-semibold tracking-widest text-amber-200">F</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs md:text-sm font-light tracking-[0.28em] text-white/95 uppercase">
            FEA <span className="text-amber-300/80 font-normal">ATELIER</span>
          </span>
          <span className="text-[9px] tracking-[0.2em] text-stone-400 uppercase hidden sm:inline">
            Spatial Showroom
          </span>
        </div>
      </div>

      {/* Center Subtle Atmosphere HUD Controls */}
      <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-stone-950/60 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/10 shadow-2xl shadow-black/50">
        {/* Hotspots visibility toggle */}
        <button
          onClick={toggleHotspotsVisible}
          onMouseEnter={() => sounds.playHover()}
          title={hotspotsVisible ? 'Hide Hotspot Markers' : 'Show Hotspot Markers'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          {hotspotsVisible ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{products.length} Curations</span>
            </>
          ) : (
            <>
              <EyeOff size={13} className="text-stone-400" />
              <span className="text-stone-400">Markers Hidden</span>
            </>
          )}
        </button>

        <div className="w-px h-3 bg-white/15 mx-0.5"></div>

        {/* Lighting mode cycle */}
        <button
          onClick={cycleLightingMode}
          onMouseEnter={() => sounds.playHover()}
          title={`Current: ${lightingMode}. Click to switch atmosphere.`}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          {lightingMode === 'warm-day' && (
            <>
              <SunMedium size={13} className="text-amber-400" />
              <span>Sunlight</span>
            </>
          )}
          {lightingMode === 'ambient-evening' && (
            <>
              <Moon size={13} className="text-amber-200" />
              <span>Evening</span>
            </>
          )}
          {lightingMode === 'gallery-focus' && (
            <>
              <Eye size={13} className="text-emerald-300" />
              <span>Spotlight</span>
            </>
          )}
        </button>

        <div className="w-px h-3 bg-white/15 mx-0.5"></div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          onMouseEnter={() => sounds.playHover()}
          title={soundEnabled ? 'Mute Atmosphere Audio' : 'Enable Spatial Audio Chimes'}
          className="p-1 rounded-full text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 size={13} className="text-amber-300" />
          ) : (
            <VolumeX size={13} className="text-stone-400" />
          )}
        </button>
      </div>

      {/* Right Controls: Cart Bag & Hamburger */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Cart Trigger */}
        <button
          id="nav-cart-trigger"
          onClick={openCart}
          onMouseEnter={() => sounds.playHover()}
          className="relative flex items-center justify-center w-11 h-11 rounded-full bg-stone-950/70 backdrop-blur-md border border-white/10 hover:border-amber-400/50 hover:bg-stone-900 transition-all duration-300 shadow-lg shadow-black/40 group"
          aria-label="View Shopping Cart"
        >
          <ShoppingBag
            size={18}
            className="text-stone-200 group-hover:text-amber-200 transition-colors duration-300"
          />
          {totalCartItems > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-black text-[10px] font-bold shadow-md shadow-amber-500/50 animate-subtle-aura">
              {totalCartItems}
            </span>
          )}
        </button>

        {/* Minimal Hamburger Menu Button */}
        <button
          onClick={toggleMenu}
          onMouseEnter={() => sounds.playHover()}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-stone-950/70 backdrop-blur-md border border-white/10 hover:border-amber-400/50 hover:bg-stone-900 transition-all duration-300 shadow-lg shadow-black/40 group focus:outline-none"
          aria-label={isMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
        >
          <div className="w-5 h-4 flex flex-col justify-between items-center py-0.5">
            <span
              className={`w-5 h-[1.5px] bg-stone-200 group-hover:bg-amber-200 transition-all duration-300 ease-out origin-center ${
                isMenuOpen ? 'rotate-45 translate-y-[5.5px] bg-amber-300' : ''
              }`}
            />
            <span
              className={`w-3.5 h-[1.5px] self-end bg-stone-200 group-hover:w-5 group-hover:bg-amber-200 transition-all duration-300 ease-out ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-5 h-[1.5px] bg-stone-200 group-hover:bg-amber-200 transition-all duration-300 ease-out origin-center ${
                isMenuOpen ? '-rotate-45 -translate-y-[5.5px] bg-amber-300' : ''
              }`}
            />
          </div>
        </button>
      </div>
    </header>
  );
};
