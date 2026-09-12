'use client';

import React from 'react';
import { ShowroomProvider } from '@/context/ShowroomContext';
import { MinimalNav } from '@/components/Navigation/MinimalNav';
import { FullscreenMenu } from '@/components/Navigation/FullscreenMenu';
import { HeroRoom } from '@/components/Hero/HeroRoom';
import { ProductMorphModal } from '@/components/ProductModal/ProductMorphModal';
import { CartSidebar } from '@/components/Cart/CartSidebar';
import { FlyingProductProxy } from '@/components/Cart/FlyingProductProxy';

export default function Home() {
  return (
    <ShowroomProvider>
      <main className="relative w-screen h-screen overflow-hidden bg-[#090807] flex flex-col items-center justify-center">
        {/* 1. Minimal Navigation (Logo, Atmosphere HUD, Cart Bag, Hamburger) */}
        <MinimalNav />

        {/* 2. Fullscreen Cinematic Overlay Menu */}
        <FullscreenMenu />

        {/* 3. The One Main Hero Section (Single Image 3D Showroom & Hotspots) */}
        <HeroRoom />

        {/* 4. Product FLIP / MORPH 3D Detail Experience */}
        <ProductMorphModal />

        {/* 5. Flying Add-to-Cart Transition Proxy */}
        <FlyingProductProxy />

        {/* 6. Sliding Cart Drawer */}
        <CartSidebar />
      </main>
    </ShowroomProvider>
  );
}
