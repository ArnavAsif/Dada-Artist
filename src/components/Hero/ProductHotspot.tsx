'use client';

import React, { useRef, useState } from 'react';
import { Product } from '@/types';
import { useShowroom } from '@/context/ShowroomContext';
import { ArrowUpRight } from 'lucide-react';
import { sounds } from '@/utils/sound';

interface ProductHotspotProps {
  product: Product;
}

export const ProductHotspot: React.FC<ProductHotspotProps> = ({ product }) => {
  const { openProduct, setHoveredProduct, hotspotsVisible, selectedProduct } = useShowroom();
  const hotspotRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  // If this product is currently the open modal, keep it transparent to avoid visual duplication
  const isSelected = selectedProduct?.id === product.id;

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > 8 || dy > 8) {
      isDraggingRef.current = true;
      setIsHovered(false);
      setHoveredProduct(null);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }
    if (!hotspotRef.current) return;
    const rect = hotspotRef.current.getBoundingClientRect();
    openProduct(product, rect);
  };

  const handleMouseEnter = () => {
    // Only show hover state if window is desktop size
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    setIsHovered(true);
    setHoveredProduct(product);
    sounds.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoveredProduct(null);
  };

  // Determine tooltip orientation based on hotspot location
  const isTopHalf = product.hotspot.y < 50;
  const isRightHalf = product.hotspot.x > 60;

  return (
    <div
      ref={hotspotRef}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.title}`}
      className={`absolute cursor-pointer select-none transition-all duration-300 ease-out group ${
        isSelected ? 'opacity-0 pointer-events-none' : hotspotsVisible ? 'opacity-100' : 'opacity-0 hover:opacity-100'
      }`}
      style={{
        left: `${product.hotspot.x}%`,
        top: `${product.hotspot.y}%`,
        width: `${product.hotspot.width}%`,
        height: `${product.hotspot.height}%`,
        zIndex: isHovered ? 35 : product.hotspot.zIndex || 10,
        transform: isHovered ? 'scale(1.02) translateZ(10px)' : 'scale(1) translateZ(0)',
      }}
    >
      {/* SVG Animated Traveling Light Border */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`glow-${product.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Static faint baseline track */}
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="10"
          fill="transparent"
          stroke="rgba(245, 158, 11, 0.18)"
          strokeWidth="1"
          className="transition-all duration-300 group-hover:stroke-amber-400/40"
        />

        {/* Traveling light beam around perimeter */}
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="10"
          fill="transparent"
          stroke={isHovered ? 'rgba(251, 191, 36, 0.95)' : 'rgba(226, 177, 112, 0.55)'}
          strokeWidth={isHovered ? '2' : '1.2'}
          strokeDasharray={isHovered ? '40 20' : '24 36'}
          filter={`url(#glow-${product.id})`}
          className="animate-dash-travel transition-all duration-300"
        />
      </svg>

      {/* Elegant Corner Reticles (Architectural Museum Brackets) */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300/80 rounded-tl transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"></div>
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300/80 rounded-tr transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"></div>
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300/80 rounded-bl transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:translate-y-0.5"></div>
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300/80 rounded-br transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>

      {/* Subtle Inner Ambient Glow on Hover */}
      <div
        className={`absolute inset-0 rounded-[10px] pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100 bg-amber-400/[0.07]' : 'opacity-0'
        }`}
      />

      {/* Center Beacon Pulse Indicator (When Not Hovered) */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-90'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300/90 animate-subtle-aura shadow-lg shadow-amber-500/60" />
          <span className="absolute w-5 h-5 rounded-full border border-amber-400/40 animate-ping opacity-40" />
        </div>
      </div>

      {/* Minimal Floating Preview Tag on Hover */}
      <div
        className={`absolute pointer-events-none z-50 transition-all duration-300 ease-out transform hidden md:block ${
          isHovered
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 pointer-events-none ' + (isTopHalf ? '-translate-y-2' : 'translate-y-2')
        } ${isTopHalf ? 'top-full mt-3' : 'bottom-full mb-3'} ${
          isRightHalf ? 'right-0' : 'left-0'
        }`}
      >
        <div className="min-w-[210px] max-w-[260px] p-3 rounded-xl bg-stone-950/90 backdrop-blur-xl border border-amber-400/30 shadow-2xl shadow-black/80 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] tracking-wider uppercase text-amber-300 font-mono">
            <span>{product.category}</span>
            <ArrowUpRight size={12} className="text-amber-400" />
          </div>

          <div className="text-xs font-medium text-stone-100 leading-tight">
            {product.title}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
            <span className="font-mono text-amber-200 font-semibold">
              ${product.price.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-400 tracking-wider uppercase">
              Click to Inspect
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
