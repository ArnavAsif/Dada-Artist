'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useShowroom } from '@/context/ShowroomContext';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Maximize2,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { sounds } from '@/utils/sound';

export const ProductMorphModal: React.FC = () => {
  const {
    selectedProduct,
    sourceRect,
    isModalOpen,
    isReversing,
    closeProduct,
    finishCloseModal,
    addToCart,
  } = useShowroom();

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'artisan'>('overview');
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  // Reset quantity and tab on new product selection
  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setActiveTab('overview');
      setIsAddedAnimation(false);
    }
  }, [selectedProduct]);

  // Compute destination target rectangle
  const getDestinationRect = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let destWidth: number;
    let destHeight: number;

    if (vw < 768) {
      // Mobile: nearly full width, vertically scrollable card
      destWidth = Math.min(vw - 24, 480);
      destHeight = Math.min(vh - 32, 680);
    } else if (vw < 1024) {
      // Tablet
      destWidth = Math.min(vw - 48, 760);
      destHeight = Math.min(vh - 60, 620);
    } else {
      // Desktop: spacious luxury landscape presentation
      destWidth = Math.min(1020, vw - 80);
      destHeight = Math.min(640, vh - 60);
    }

    const destLeft = (vw - destWidth) / 2;
    const destTop = (vh - destHeight) / 2;

    return { left: destLeft, top: destTop, width: destWidth, height: destHeight };
  }, []);

  // FLIP / MORPH forward animation
  useEffect(() => {
    if (!isModalOpen || !sourceRect || !cardRef.current || !selectedProduct) return;

    const card = cardRef.current;
    const overlay = overlayRef.current;
    const details = detailsRef.current;
    const dest = getDestinationRect();

    // Determine 3D departure tilt based on hotspot position relative to screen center
    const isLeftOrigin = sourceRect.left < window.innerWidth / 2;
    const isTopOrigin = sourceRect.top < window.innerHeight / 2;
    const initialRotateY = isLeftOrigin ? 10 : -10;
    const initialRotateX = isTopOrigin ? -7 : 7;

    // 1. Initial State: Exactly positioned at the source hotspot in the image
    gsap.set(overlay, { opacity: 1, pointerEvents: 'auto' });
    gsap.set(card, {
      position: 'fixed',
      left: sourceRect.left,
      top: sourceRect.top,
      width: sourceRect.width,
      height: sourceRect.height,
      borderRadius: '12px',
      transformStyle: 'preserve-3d',
      transformOrigin: 'center center',
      rotateY: initialRotateY,
      rotateX: initialRotateX,
      z: 20,
      scale: 1,
      opacity: 1,
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    });

    if (details) {
      gsap.set(details, { opacity: 0, x: 20 });
    }

    // 2. Timeline: Lift -> Expand & Morph -> Settle
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
    });

    // Step A: Product physically lifts off the image plane
    tl.to(card, {
      z: 90,
      scale: 1.08,
      boxShadow: '0 35px 70px -15px rgba(0,0,0,0.85), 0 0 50px rgba(226, 177, 112, 0.35)',
      duration: 0.24,
      ease: 'power2.out',
    });

    // Step B: Morph to center destination & expand dimensions
    tl.to(
      card,
      {
        left: dest.left,
        top: dest.top,
        width: dest.width,
        height: dest.height,
        borderRadius: '24px',
        rotateY: 0,
        rotateX: 0,
        z: 0,
        scale: 1,
        duration: 0.52,
        ease: 'power3.out',
      },
      '-=0.08'
    );

    // Step C: Fade and slide in details
    if (details) {
      tl.to(
        details,
        {
          opacity: 1,
          x: 0,
          duration: 0.38,
          ease: 'power2.out',
        },
        '-=0.25'
      );
    }
  }, [isModalOpen, sourceRect, selectedProduct, getDestinationRect]);

  // REVERSE animation back to exact hotspot position
  useEffect(() => {
    if (!isReversing || !sourceRect || !cardRef.current) return;

    const card = cardRef.current;
    const overlay = overlayRef.current;
    const details = detailsRef.current;

    const isLeftOrigin = sourceRect.left < window.innerWidth / 2;
    const isTopOrigin = sourceRect.top < window.innerHeight / 2;
    const returnRotateY = isLeftOrigin ? 10 : -10;
    const returnRotateX = isTopOrigin ? -7 : 7;

    const tl = gsap.timeline({
      onComplete: () => {
        finishCloseModal();
      },
    });

    // Step A: Details fade out quickly
    if (details) {
      tl.to(details, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
      });
    }

    // Step B: Card shrinks and flies back into original hero hotspot position
    tl.to(
      card,
      {
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
        borderRadius: '12px',
        rotateY: returnRotateY,
        rotateX: returnRotateX,
        z: 30,
        scale: 1.04,
        duration: 0.45,
        ease: 'power3.inOut',
      },
      '-=0.05'
    );

    // Step C: Settles back into image surface
    tl.to(card, {
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      z: 0,
      opacity: 0,
      duration: 0.15,
      ease: 'power2.out',
    });

    // Fade out overlay
    if (overlay) {
      tl.to(
        overlay,
        {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        },
        '-=0.2'
      );
    }
  }, [isReversing, sourceRect, finishCloseModal]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen && !isReversing) {
        closeProduct();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isReversing, closeProduct]);

  // Interactive 3D tilt on the large product image inside open card
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(imageContainerRef.current, {
      rotateY: x * 14,
      rotateX: -y * 14,
      duration: 0.4,
      ease: 'power1.out',
      transformPerspective: 800,
    });
  };

  const handleImageMouseLeave = () => {
    if (!imageContainerRef.current) return;
    gsap.to(imageContainerRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: 'power2.out',
    });
  };

  // Add to cart with trigger animation
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    setIsAddedAnimation(true);
    addToCart(selectedProduct, quantity, imageRef.current);

    setTimeout(() => {
      setIsAddedAnimation(false);
    }, 1200);
  };

  if (!isModalOpen || !selectedProduct) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 opacity-0 pointer-events-none perspective-1200 flex items-center justify-center p-3 md:p-6"
      style={{
        background: 'radial-gradient(circle at center, rgba(10,8,7,0.72) 0%, rgba(5,4,3,0.92) 100%)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === overlayRef.current && !isReversing) {
          closeProduct();
        }
      }}
    >
      {/* Morphing Product Card */}
      <div
        ref={cardRef}
        className="will-change-transform overflow-hidden bg-stone-950/95 border border-amber-500/20 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col md:flex-row select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Close Button */}
        <button
          onClick={closeProduct}
          onMouseEnter={() => sounds.playHover()}
          className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full bg-stone-900/80 border border-white/15 text-stone-300 hover:text-white hover:border-amber-400/50 hover:bg-stone-800 transition-all duration-300 flex items-center justify-center group shadow-xl"
          aria-label="Return to Room"
        >
          <X size={18} className="group-hover:rotate-90 transition-transform duration-300 text-amber-300" />
        </button>

        {/* LEFT COLUMN: Large Product Image with 3D Depth View */}
        <div
          className="relative w-full md:w-[48%] h-[260px] md:h-full bg-gradient-to-br from-stone-900/90 via-stone-950 to-[#120f0d] flex items-center justify-center p-6 md:p-10 border-b md:border-b-0 md:border-r border-white/10 overflow-hidden"
          onMouseMove={handleImageMouseMove}
          onMouseLeave={handleImageMouseLeave}
        >
          {/* Ambient Lighting Gradient Behind Product */}
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Spatial Coordinates Tag */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/80 border border-white/10 text-[10px] tracking-widest uppercase font-mono text-stone-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{selectedProduct.spatialTag}</span>
          </div>

          {/* 3D Floating Product Image */}
          <div
            ref={imageContainerRef}
            className="relative w-full h-full max-h-[380px] flex items-center justify-center transform-style-3d cursor-grab active:cursor-grabbing transition-shadow"
          >
            <div className="relative w-full h-full max-w-[420px] max-h-[380px] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-amber-400/20">
              <Image
                ref={imageRef}
                src={selectedProduct.image}
                alt={selectedProduct.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-2 md:p-4 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

          {/* Bottom Floating Hint */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] text-stone-400 font-light pointer-events-none">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400/80" />
              <span>Interactive 3D Object View</span>
            </span>
            <span className="font-mono text-stone-500">100% Bespoke Craft</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Editorial & Purchase Panel */}
        <div
          ref={detailsRef}
          className="relative w-full md:w-[52%] h-full flex flex-col justify-between p-6 md:p-10 overflow-y-auto"
        >
          {/* Header & Badges */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-amber-400 font-mono">
                {selectedProduct.category}
              </span>
              {selectedProduct.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] tracking-wider uppercase font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {selectedProduct.badge}
                </span>
              )}
            </div>

            <h2 className="text-xl md:text-3xl font-light tracking-tight text-white leading-tight">
              {selectedProduct.title}
            </h2>

            <p className="text-xs text-stone-400 mt-1 font-light tracking-wide">
              {selectedProduct.subtitle}
            </p>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mt-4 pb-4 border-b border-white/10">
              <span className="text-2xl md:text-3xl font-light font-mono text-amber-200">
                ${selectedProduct.price.toLocaleString()}
              </span>
              {selectedProduct.originalPrice && (
                <span className="text-sm font-mono text-stone-500 line-through">
                  ${selectedProduct.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-[11px] text-stone-400 font-light ml-auto flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{selectedProduct.leadTime}</span>
              </span>
            </div>

            {/* Tabs for Overview / Specs / Heritage */}
            <div className="flex items-center gap-4 mt-5 border-b border-white/10 text-xs">
              <button
                onClick={() => {
                  sounds.playHover();
                  setActiveTab('overview');
                }}
                className={`pb-2.5 tracking-wider uppercase font-medium transition-colors relative ${
                  activeTab === 'overview'
                    ? 'text-amber-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Story
                {activeTab === 'overview' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400" />
                )}
              </button>

              <button
                onClick={() => {
                  sounds.playHover();
                  setActiveTab('specs');
                }}
                className={`pb-2.5 tracking-wider uppercase font-medium transition-colors relative ${
                  activeTab === 'specs'
                    ? 'text-amber-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Specifications
                {activeTab === 'specs' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400" />
                )}
              </button>

              <button
                onClick={() => {
                  sounds.playHover();
                  setActiveTab('artisan');
                }}
                className={`pb-2.5 tracking-wider uppercase font-medium transition-colors relative ${
                  activeTab === 'artisan'
                    ? 'text-amber-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Materials
                {activeTab === 'artisan' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400" />
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-4 min-h-[110px] text-xs leading-relaxed text-stone-300 font-light">
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  <p>{selectedProduct.description}</p>
                  <p className="text-stone-400 italic font-serif text-[11px] border-l-2 border-amber-400/40 pl-3">
                    &ldquo;{selectedProduct.story}&rdquo;
                  </p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 gap-2">
                  {selectedProduct.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1 border-b border-white/5 text-[11px]"
                    >
                      <span className="text-stone-400 font-medium">{spec.label}</span>
                      <span className="text-stone-200 font-mono">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'artisan' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.materials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-stone-900 border border-white/10 text-stone-300 text-[11px]"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-stone-400 flex items-center gap-2 pt-2">
                    <ShieldCheck size={14} className="text-amber-400" />
                    <span>Includes Certificate of Handcrafted Authenticity & Provenance</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Row: Quantity & Add to Cart */}
          <div className="pt-4 border-t border-white/10 mt-auto">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center rounded-xl bg-stone-900 border border-white/15 p-1">
                <button
                  onClick={() => {
                    sounds.playHover();
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  aria-label="Decrease Quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-9 text-center font-mono text-sm font-semibold text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    sounds.playHover();
                    setQuantity((q) => Math.min(selectedProduct.stock, q + 1));
                  }}
                  disabled={quantity >= selectedProduct.stock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  aria-label="Increase Quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Primary Add to Cart CTA */}
              <button
                id="add-to-cart-cta"
                onClick={handleAddToCart}
                onMouseEnter={() => sounds.playHover()}
                className={`flex-1 relative overflow-hidden h-11 px-6 rounded-xl font-medium text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group ${
                  isAddedAnimation
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-xl shadow-amber-500/20 hover:shadow-amber-400/40 hover:scale-[1.01]'
                }`}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 animate-gold-shimmer pointer-events-none opacity-50" />

                <ShoppingBag size={16} className="transition-transform group-hover:scale-110" />
                <span>
                  {isAddedAnimation ? 'Added to Cart' : `Add to Cart • $${(selectedProduct.price * quantity).toLocaleString()}`}
                </span>
              </button>
            </div>

            {/* Micro Guarantees */}
            <div className="flex items-center justify-between text-[10px] text-stone-400 pt-3">
              <span className="flex items-center gap-1.5">
                <Truck size={12} className="text-amber-400/80" />
                <span>Complimentary White-Glove Shipping</span>
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw size={12} className="text-stone-400" />
                <span>30-Day Atelier Guarantee</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
