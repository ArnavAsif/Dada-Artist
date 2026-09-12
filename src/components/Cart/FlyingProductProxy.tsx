'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useShowroom } from '@/context/ShowroomContext';

export const FlyingProductProxy: React.FC = () => {
  const { flyingProduct, clearFlyingProduct } = useShowroom();
  const proxyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flyingProduct || !proxyRef.current) return;

    const el = proxyRef.current;
    const { startRect } = flyingProduct;

    // Target cart icon in nav or top-right
    const cartBtn = document.getElementById('nav-cart-trigger');
    const targetRect = cartBtn
      ? cartBtn.getBoundingClientRect()
      : { left: window.innerWidth - 60, top: 30, width: 44, height: 44 };

    // Initial state: matches product image position in modal
    gsap.set(el, {
      position: 'fixed',
      left: startRect.left,
      top: startRect.top,
      width: startRect.width,
      height: startRect.height,
      borderRadius: '16px',
      opacity: 1,
      scale: 1,
      rotate: 0,
      zIndex: 9999,
      pointerEvents: 'none',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    });

    const targetX = targetRect.left + targetRect.width / 2 - 24;
    const targetY = targetRect.top + targetRect.height / 2 - 24;

    const tl = gsap.timeline({
      onComplete: () => {
        // Bounce pulse the cart icon
        if (cartBtn) {
          gsap.timeline()
            .to(cartBtn, { scale: 1.25, duration: 0.15, ease: 'power2.out' })
            .to(cartBtn, { scale: 1, duration: 0.3, ease: 'elastic.out(1.2, 0.4)' });
        }
        clearFlyingProduct();
      },
    });

    // Step 1: Gentle anticipation lift
    tl.to(el, {
      scale: 1.05,
      y: -15,
      boxShadow: '0 30px 60px rgba(245, 158, 11, 0.35)',
      duration: 0.15,
      ease: 'power1.out',
    });

    // Step 2: Smooth flight arc toward cart drawer icon
    tl.to(
      el,
      {
        left: targetX,
        top: targetY,
        width: 48,
        height: 48,
        borderRadius: '9999px',
        scale: 0.6,
        rotate: 18,
        opacity: 0.4,
        duration: 0.55,
        ease: 'power2.inOut',
      },
      '-=0.02'
    );

    // Step 3: Absorbed into cart icon
    tl.to(
      el,
      {
        scale: 0,
        opacity: 0,
        duration: 0.1,
        ease: 'power2.in',
      },
      '-=0.05'
    );
  }, [flyingProduct, clearFlyingProduct]);

  if (!flyingProduct) return null;

  return (
    <div
      ref={proxyRef}
      className="overflow-hidden border border-amber-400/60 bg-stone-900/90 backdrop-blur-md"
    >
      <div className="relative w-full h-full p-2">
        <Image
          src={flyingProduct.product.image}
          alt={flyingProduct.product.title}
          fill
          sizes="120px"
          className="object-contain"
        />
      </div>
    </div>
  );
};
