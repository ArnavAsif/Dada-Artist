'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import {
  Package,
  CheckCircle2,
  Crosshair,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroImage, setHeroImage] = useState<string>('/images/hero-room.png');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/hero-settings').then((r) => r.json()),
    ])
      .then(([productsData, heroData]) => {
        if (productsData.success && Array.isArray(productsData.products)) {
          setProducts(productsData.products);
        }
        if (heroData.success && heroData.settings?.hero_image_url) {
          setHeroImage(heroData.settings.hero_image_url);
        }
      })
      .catch((err) => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active !== false).length;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Public Showroom Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Sparkles size={14} />
            <span>Showroom Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Manage your spatial catalogue, hero composition, and interactive hotspots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
          >
            <Plus size={15} />
            <span>New Product</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-stone-200 text-xs font-medium tracking-wide transition-colors"
          >
            <span>Live Showroom</span>
            <ExternalLink size={13} className="text-amber-400" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Products */}
        <div className="p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
              Total Catalog Products
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-300">
              <Package size={16} />
            </div>
          </div>
          <div className="text-3xl font-light font-mono text-white mt-4">
            {loading ? '...' : totalProducts}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Artifacts in spatial catalog</div>
        </div>

        {/* Active Hotspots */}
        <div className="p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
              Active Showroom Hotspots
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-light font-mono text-emerald-400 mt-4">
            {loading ? '...' : activeProducts}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Illuminated in public showroom</div>
        </div>

        {/* Hotspot Precision */}
        <div className="p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
              Spatial Coordinates
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Crosshair size={16} />
            </div>
          </div>
          <div className="text-3xl font-light font-mono text-blue-300 mt-4">
            100%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Relative percentage positioning</div>
        </div>
      </div>

      {/* Hero Image Preview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-light text-white flex items-center gap-2">
              <ImageIcon size={18} className="text-amber-400" />
              <span>Current Hero Image Composition</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5 font-light">
              This master high-resolution render is the centerpiece of the public showroom.
            </p>
          </div>

          <Link
            href="/admin/hero"
            className="text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>Manage Hero Image</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="relative w-full aspect-[1679/937] max-h-[420px] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
          <Image
            src={heroImage}
            alt="Hero Showroom Render"
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          href="/admin/hotspots"
          className="group p-6 rounded-2xl bg-stone-950/70 hover:bg-stone-900/80 border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex items-start gap-4 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shrink-0">
            <Crosshair size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors flex items-center justify-between">
              <span>Visual Hotspot Editor</span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-stone-400 font-light mt-1 leading-relaxed">
              Drag, resize, and fine-tune each product&apos;s illuminated boundary directly over the hero image canvas.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="group p-6 rounded-2xl bg-stone-950/70 hover:bg-stone-900/80 border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex items-start gap-4 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shrink-0">
            <Package size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors flex items-center justify-between">
              <span>Manage Products & Reorder</span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-stone-400 font-light mt-1 leading-relaxed">
              Edit pricing, title, description, high-resolution product photography, and active visibility states.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
