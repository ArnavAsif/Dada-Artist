'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useShowroom } from '@/context/ShowroomContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { sounds } from '@/utils/sound';

export const CartSidebar: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalCartItems,
    totalCartAmount,
    openProduct,
  } = useShowroom();

  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // GSAP Drawer Animation
  useEffect(() => {
    if (!drawerRef.current || !backdropRef.current) return;

    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      const tl = gsap.timeline();

      tl.to(backdropRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.35,
        ease: 'power2.out',
      });

      tl.fromTo(
        drawerRef.current,
        { x: '100%', rotateY: 8 },
        { x: '0%', rotateY: 0, duration: 0.5, ease: 'power3.out' },
        '-=0.25'
      );
    } else {
      document.body.style.overflow = '';
      const tl = gsap.timeline();

      tl.to(drawerRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power3.in',
      });

      tl.to(
        backdropRef.current,
        {
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.3,
          ease: 'power2.in',
        },
        '-=0.2'
      );
    }
  }, [isCartOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  const handleCheckout = () => {
    sounds.playAddToCart();
    setIsCheckingOut(true);

    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);

      setTimeout(() => {
        setCheckoutComplete(false);
      }, 4000);
    }, 1500);
  };

  const freeShippingThreshold = 2500;
  const progressToFreeShipping = Math.min(100, (totalCartAmount / freeShippingThreshold) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={closeCart}
        className="fixed inset-0 z-50 opacity-0 pointer-events-none bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] md:w-[500px] bg-stone-950/95 backdrop-blur-2xl border-l border-amber-500/20 shadow-2xl flex flex-col justify-between transform translate-x-full will-change-transform select-none"
        aria-label="Shopping Cart Drawer"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
              <ShoppingBag size={15} className="text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-light tracking-[0.2em] uppercase text-white">
                Curated Selection
              </h3>
              <p className="text-[11px] text-stone-400 font-mono">
                {totalCartItems} {totalCartItems === 1 ? 'Artifact' : 'Artifacts'} in Bag
              </p>
            </div>
          </div>

          <button
            onClick={closeCart}
            onMouseEnter={() => sounds.playHover()}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/40 text-stone-300 hover:text-white transition-all duration-300 flex items-center justify-center group"
            aria-label="Close cart"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform duration-300 text-amber-300" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-6 py-3 bg-stone-900/50 border-b border-white/5">
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-light">
            <span className="flex items-center gap-1.5 text-stone-300">
              <Truck size={13} className="text-amber-400" />
              {totalCartAmount >= freeShippingThreshold ? (
                <span className="text-amber-300 font-medium">
                  Complimentary White-Glove Shipping Unlocked!
                </span>
              ) : (
                <span>
                  Add{' '}
                  <strong className="font-mono text-amber-200">
                    ${(freeShippingThreshold - totalCartAmount).toLocaleString()}
                  </strong>{' '}
                  for Complimentary White-Glove Delivery
                </span>
              )}
            </span>
            <span className="font-mono text-[10px] text-stone-400">
              {Math.round(progressToFreeShipping)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full border border-dashed border-stone-700 flex items-center justify-center mb-4 text-stone-500">
                <Sparkles size={24} className="text-amber-400/60" />
              </div>
              <h4 className="text-base font-light text-stone-200 tracking-wide">
                Your Spatial Bag is Empty
              </h4>
              <p className="text-xs text-stone-400 max-w-[240px] mt-1 font-light leading-relaxed">
                Click any illuminated product hotspot in the showroom to inspect and collect bespoke pieces.
              </p>
              <button
                onClick={closeCart}
                onMouseEnter={() => sounds.playHover()}
                className="mt-6 px-5 py-2.5 rounded-full border border-amber-400/30 text-xs font-medium tracking-wider uppercase text-amber-300 hover:bg-amber-400/10 transition-colors"
              >
                Explore Room
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-400/30 transition-all duration-300 flex gap-4"
              >
                {/* Thumbnail */}
                <div
                  className="relative w-20 h-20 rounded-lg overflow-hidden bg-stone-900 border border-white/10 shrink-0 cursor-pointer"
                  onClick={() => {
                    closeCart();
                    // Open product directly if clicked
                    const rect = document.getElementById(`hotspot-${item.product.id}`)?.getBoundingClientRect() || {
                      left: window.innerWidth / 2 - 100,
                      top: window.innerHeight / 2 - 100,
                      width: 200,
                      height: 200,
                    } as DOMRect;
                    openProduct(item.product, rect);
                  }}
                >
                  <Image
                    src={item.product.image}
                    alt={item.product.title}
                    fill
                    sizes="80px"
                    className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Info & Controls */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] tracking-wider uppercase font-mono text-amber-400/80">
                        {item.product.category}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        onMouseEnter={() => sounds.playHover()}
                        className="text-stone-500 hover:text-red-400 transition-colors p-1"
                        aria-label={`Remove ${item.product.title}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <h4 className="text-xs font-medium text-stone-100 line-clamp-1 leading-snug">
                      {item.product.title}
                    </h4>

                    <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                      ${item.product.price.toLocaleString()} each
                    </div>
                  </div>

                  {/* Quantity and Subtotal */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                    <div className="flex items-center rounded-lg bg-stone-900/80 border border-white/10 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-7 text-center font-mono text-xs text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-semibold text-amber-200">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-6 bg-stone-900/80 border-t border-white/10 backdrop-blur-md space-y-4">
            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-stone-400 font-light">
                <span>Curated Subtotal</span>
                <span className="font-mono text-stone-200 font-medium">
                  ${totalCartAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-400 font-light">
                <span>Architectural White-Glove Handling</span>
                <span className="font-mono text-emerald-400">Complimentary</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm font-medium">
                <span className="text-white">Estimated Total</span>
                <span className="font-mono text-lg text-amber-300">
                  ${totalCartAmount.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            {checkoutComplete ? (
              <div className="w-full py-3.5 px-4 rounded-xl bg-emerald-700/80 border border-emerald-500/50 text-white flex items-center justify-center gap-2 text-xs font-medium tracking-wider uppercase">
                <CheckCircle2 size={16} className="text-white" />
                <span>Atelier Order Dispatched to Concierge</span>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                onMouseEnter={() => sounds.playHover()}
                className="w-full relative overflow-hidden h-12 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:shadow-amber-400/30 group"
              >
                <div className="absolute inset-0 animate-gold-shimmer pointer-events-none opacity-40" />

                {isCheckingOut ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
                    <span>Preparing Atelier Transfer...</span>
                  </div>
                ) : (
                  <>
                    <span>Proceed to Atelier Checkout</span>
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-light">
              <ShieldCheck size={12} className="text-amber-400/70" />
              <span>Encrypted Checkout • Insured Architectural Transport</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
