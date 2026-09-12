'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Product, HotspotCoordinates } from '@/types';
import {
  Crosshair,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Move,
  Maximize2,
  ExternalLink,
  Layers,
} from 'lucide-react';

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;

function HotspotEditorContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('select');

  const canvasRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroImage, setHeroImage] = useState<string>('/images/hero-room.png');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // Local working copy of selected product hotspot coordinates
  const [activeCoords, setActiveCoords] = useState<HotspotCoordinates>({
    x: 50,
    y: 50,
    width: 12,
    height: 18,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Drag interaction state
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    initialCoords: HotspotCoordinates;
  } | null>(null);

  // Load products and hero image
  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/hero-settings').then((r) => r.json()),
    ])
      .then(([productsData, heroData]) => {
        if (productsData.success && Array.isArray(productsData.products)) {
          setProducts(productsData.products);
          const initialId =
            preselectedId && productsData.products.some((p: Product) => p.id === preselectedId)
              ? preselectedId
              : productsData.products[0]?.id || '';
          setSelectedProductId(initialId);

          const found = productsData.products.find((p: Product) => p.id === initialId);
          if (found) {
            setActiveCoords({ ...found.hotspot });
          }
        }
        if (heroData.success && heroData.settings?.hero_image_url) {
          setHeroImage(heroData.settings.hero_image_url);
        }
      })
      .catch((err) => console.error('Failed to load hotspot editor data:', err))
      .finally(() => setLoading(false));
  }, [preselectedId]);

  // When selection changes
  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setActiveCoords({ ...prod.hotspot });
      setHasUnsavedChanges(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Start dragging or resizing
  const handleMouseDown = (e: React.MouseEvent, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canvasRef.current) return;

    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      initialCoords: { ...activeCoords },
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !canvasRef.current) return;

    const { mode, startX, startY, initialCoords } = dragRef.current;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return;

    const deltaXPct = ((e.clientX - startX) / canvasRect.width) * 100;
    const deltaYPct = ((e.clientY - startY) / canvasRect.height) * 100;

    let { x, y, width, height } = initialCoords;

    if (mode === 'move') {
      x = Math.max(0, Math.min(100 - width, initialCoords.x + deltaXPct));
      y = Math.max(0, Math.min(100 - height, initialCoords.y + deltaYPct));
    } else if (mode === 'se') {
      width = Math.max(2, Math.min(100 - x, initialCoords.width + deltaXPct));
      height = Math.max(2, Math.min(100 - y, initialCoords.height + deltaYPct));
    } else if (mode === 'sw') {
      const newWidth = Math.max(2, initialCoords.width - deltaXPct);
      const newX = Math.max(0, initialCoords.x + deltaXPct);
      if (newWidth >= 2 && newX >= 0) {
        x = newX;
        width = newWidth;
      }
      height = Math.max(2, Math.min(100 - y, initialCoords.height + deltaYPct));
    } else if (mode === 'ne') {
      width = Math.max(2, Math.min(100 - x, initialCoords.width + deltaXPct));
      const newHeight = Math.max(2, initialCoords.height - deltaYPct);
      const newY = Math.max(0, initialCoords.y + deltaYPct);
      if (newHeight >= 2 && newY >= 0) {
        y = newY;
        height = newHeight;
      }
    } else if (mode === 'nw') {
      const newWidth = Math.max(2, initialCoords.width - deltaXPct);
      const newX = Math.max(0, initialCoords.x + deltaXPct);
      const newHeight = Math.max(2, initialCoords.height - deltaYPct);
      const newY = Math.max(0, initialCoords.y + deltaYPct);
      if (newWidth >= 2 && newX >= 0) {
        x = newX;
        width = newWidth;
      }
      if (newHeight >= 2 && newY >= 0) {
        y = newY;
        height = newHeight;
      }
    } else if (mode === 'e') {
      width = Math.max(2, Math.min(100 - x, initialCoords.width + deltaXPct));
    } else if (mode === 'w') {
      const newWidth = Math.max(2, initialCoords.width - deltaXPct);
      const newX = Math.max(0, initialCoords.x + deltaXPct);
      if (newWidth >= 2 && newX >= 0) {
        x = newX;
        width = newWidth;
      }
    } else if (mode === 's') {
      height = Math.max(2, Math.min(100 - y, initialCoords.height + deltaYPct));
    } else if (mode === 'n') {
      const newHeight = Math.max(2, initialCoords.height - deltaYPct);
      const newY = Math.max(0, initialCoords.y + deltaYPct);
      if (newHeight >= 2 && newY >= 0) {
        y = newY;
        height = newHeight;
      }
    }

    // Round to 1 decimal place for clean coordinates
    setActiveCoords({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
      zIndex: initialCoords.zIndex,
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Save Hotspot Coordinates
  const handleSaveHotspot = async () => {
    if (!selectedProductId) return;
    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/products/${selectedProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_hotspot',
          hotspot: activeCoords,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save hotspot coordinates');
      }

      // Update in local state array
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProductId ? { ...p, hotspot: { ...activeCoords } } : p))
      );

      setHasUnsavedChanges(false);
      showToast('Hotspot position & bounds saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Saving failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Revert unsaved edits
  const handleRevert = () => {
    const original = products.find((p) => p.id === selectedProductId);
    if (original) {
      setActiveCoords({ ...original.hotspot });
      setHasUnsavedChanges(false);
      showToast('Reverted to saved position.');
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const currentIndex = products.findIndex((p) => p.id === selectedProductId);

  const cycleProduct = (direction: 'prev' | 'next') => {
    if (products.length === 0) return;
    const nextIdx =
      direction === 'prev'
        ? (currentIndex - 1 + products.length) % products.length
        : (currentIndex + 1) % products.length;
    handleSelectProduct(products[nextIdx].id);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2.5 border ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
              : 'bg-red-950/90 text-red-300 border-red-500/40'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Crosshair size={14} />
            <span>Interactive Visual Editor</span>
          </div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Visual Hotspot Positioning Canvas
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Click or select any artifact. Drag and resize its animated bounding perimeter directly over the hero image.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-white/10 hover:border-amber-400/40 text-stone-300 hover:text-white text-xs font-medium transition-colors"
          >
            <span>Live Showroom</span>
            <ExternalLink size={13} className="text-amber-400" />
          </Link>

          {hasUnsavedChanges && (
            <button
              onClick={handleRevert}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-stone-400 hover:text-white text-xs transition-colors"
            >
              <RotateCcw size={13} />
              <span>Revert</span>
            </button>
          )}

          <button
            onClick={handleSaveHotspot}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-40"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Hotspot'}</span>
          </button>
        </div>
      </div>

      {/* Product Selection Bar */}
      <div className="p-4 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Selector Dropdown & Steppers */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => cycleProduct('prev')}
              className="p-2 rounded-lg bg-stone-900 border border-white/10 text-stone-400 hover:text-white transition-colors"
              title="Previous Product"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => cycleProduct('next')}
              className="p-2 rounded-lg bg-stone-900 border border-white/10 text-stone-400 hover:text-white transition-colors"
              title="Next Product"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-mono uppercase text-stone-400">Selected Product:</label>
            <select
              value={selectedProductId}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="h-10 px-3.5 rounded-xl bg-stone-900 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400/60"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (${p.price.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Coordinate Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-stone-300">
            X: <strong className="text-amber-300">{activeCoords.x}%</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-stone-300">
            Y: <strong className="text-amber-300">{activeCoords.y}%</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-stone-300">
            W: <strong className="text-amber-300">{activeCoords.width}%</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-stone-300">
            H: <strong className="text-amber-300">{activeCoords.height}%</strong>
          </span>
          {hasUnsavedChanges && (
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40">
              Unsaved
            </span>
          )}
        </div>
      </div>

      {/* Main Visual Canvas */}
      <div className="p-4 sm:p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md">
        <div
          ref={canvasRef}
          className="relative w-full aspect-[1679/937] rounded-xl overflow-hidden border border-white/15 shadow-2xl bg-black select-none"
        >
          {/* Master Room Render */}
          <Image
            src={heroImage}
            alt="Hero Showroom Canvas"
            fill
            priority
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="object-cover pointer-events-none"
          />

          {/* Vignette */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />

          {/* Render All Hotspots on Canvas */}
          {products.map((p) => {
            const isSelected = p.id === selectedProductId;
            const coords = isSelected ? activeCoords : p.hotspot;

            return (
              <div
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectProduct(p.id);
                }}
                className={`absolute transition-all ${
                  isSelected
                    ? 'z-40 ring-2 ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                    : 'z-10 hover:z-20 cursor-pointer opacity-70 hover:opacity-100'
                }`}
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  width: `${coords.width}%`,
                  height: `${coords.height}%`,
                }}
              >
                {/* SVG Animated Dash Border */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                  <rect
                    x="1"
                    y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="8"
                    fill={isSelected ? 'rgba(245, 158, 11, 0.15)' : 'transparent'}
                    stroke={isSelected ? '#fbbf24' : 'rgba(226, 177, 112, 0.6)'}
                    strokeWidth={isSelected ? '2' : '1.2'}
                    strokeDasharray={isSelected ? '32 16' : '20 20'}
                    className="animate-dash-travel"
                  />
                </svg>

                {/* Corner reticles */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300" />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300" />

                {/* Center Move Handle (Visible when Selected) */}
                {isSelected && (
                  <>
                    {/* Draggable Body */}
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'move')}
                      className="absolute inset-2 cursor-move flex items-center justify-center group"
                      title="Drag to reposition hotspot"
                    >
                      <div className="p-1.5 rounded-full bg-stone-950/80 border border-amber-400/50 text-amber-300 shadow-lg">
                        <Move size={14} />
                      </div>
                    </div>

                    {/* Corner Resize Handles */}
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'nw')}
                      className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-amber-400 border border-stone-950 rounded-sm cursor-nw-resize shadow-md"
                      title="Resize Top-Left"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'ne')}
                      className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 border border-stone-950 rounded-sm cursor-ne-resize shadow-md"
                      title="Resize Top-Right"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'sw')}
                      className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-amber-400 border border-stone-950 rounded-sm cursor-sw-resize shadow-md"
                      title="Resize Bottom-Left"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'se')}
                      className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 border border-stone-950 rounded-sm cursor-se-resize shadow-md"
                      title="Resize Bottom-Right"
                    />

                    {/* Edge Resize Handles */}
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'n')}
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-amber-300 border border-stone-950 rounded-sm cursor-n-resize"
                      title="Resize Height Top"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 's')}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-amber-300 border border-stone-950 rounded-sm cursor-s-resize"
                      title="Resize Height Bottom"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'w')}
                      className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-4 bg-amber-300 border border-stone-950 rounded-sm cursor-w-resize"
                      title="Resize Width Left"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDown(e, 'e')}
                      className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-4 bg-amber-300 border border-stone-950 rounded-sm cursor-e-resize"
                      title="Resize Width Right"
                    />
                  </>
                )}

                {/* Tooltip Tag */}
                <div
                  className={`absolute left-0 bottom-full mb-1.5 pointer-events-none text-[10px] whitespace-nowrap px-2 py-0.5 rounded bg-stone-950/90 border border-white/10 font-mono shadow-md ${
                    isSelected ? 'text-amber-300 border-amber-400/40' : 'text-stone-300 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {p.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fine-Tuning Numeric Control Bar */}
      {selectedProduct && (
        <div className="p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">
              Horizontal Position (X%)
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveCoords((c) => ({ ...c, x: Math.max(0, Math.round((c.x - 0.5) * 10) / 10) }));
                  setHasUnsavedChanges(true);
                }}
                className="w-8 h-9 rounded bg-stone-900 border border-white/10 text-stone-300 hover:text-white"
              >
                -
              </button>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={activeCoords.x}
                onChange={(e) => {
                  setActiveCoords({ ...activeCoords, x: parseFloat(e.target.value) || 0 });
                  setHasUnsavedChanges(true);
                }}
                className="flex-1 h-9 px-2 text-center rounded bg-stone-900 border border-white/10 text-xs font-mono text-white"
              />
              <button
                onClick={() => {
                  setActiveCoords((c) => ({ ...c, x: Math.min(100 - c.width, Math.round((c.x + 0.5) * 10) / 10) }));
                  setHasUnsavedChanges(true);
                }}
                className="w-8 h-9 rounded bg-stone-900 border border-white/10 text-stone-300 hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">
              Vertical Position (Y%)
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveCoords((c) => ({ ...c, y: Math.max(0, Math.round((c.y - 0.5) * 10) / 10) }));
                  setHasUnsavedChanges(true);
                }}
                className="w-8 h-9 rounded bg-stone-900 border border-white/10 text-stone-300 hover:text-white"
              >
                -
              </button>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={activeCoords.y}
                onChange={(e) => {
                  setActiveCoords({ ...activeCoords, y: parseFloat(e.target.value) || 0 });
                  setHasUnsavedChanges(true);
                }}
                className="flex-1 h-9 px-2 text-center rounded bg-stone-900 border border-white/10 text-xs font-mono text-white"
              />
              <button
                onClick={() => {
                  setActiveCoords((c) => ({ ...c, y: Math.min(100 - c.height, Math.round((c.y + 0.5) * 10) / 10) }));
                  setHasUnsavedChanges(true);
                }}
                className="w-8 h-9 rounded bg-stone-900 border border-white/10 text-stone-300 hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">
              Hotspot Width (%)
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveCoords((c) => ({ ...c, width: Math.max(2, Math.round((c.width - 0.5) * 10) / 10) }));
                  setHasUnsavedChanges(true);
                }}
                className="w-8 h-9 rounded bg-stone-900 border border-white/10 text-stone-300 hover:text-white"
              >
                -
              </button>
              <input
                type="number"
                step="0.1"
                min="2"
                max="100"
                value={activeCoords.width}
                onChange={(e) => {
                  setActiveCoords({ ...activeCoords, width: parseFloat(e.target.value) || 2 });
                  setHasUnsavedChanges(true);
                }}
                className="flex-1 h-9 px-2 text-center rounded bg-stone-900 border border-white/10 text-xs font-mono text-white"
              />
              <button
                onClick={() => {
                  setActiveCoords((c) => ({ ...c, width: Math.min(100 - c.x, Math.round((c.width + 0.5) * 10) / 10) }));
                  setHasUnsavedChanges(true);
                }}
                className="w-8 h-9 rounded bg-stone-900 border border-white/10 text-stone-300 hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-stone-400 mb-1">
              Hotspot Height (%)
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveCoords((c) => ({ ...c, height: Math.max(2, Math.round((c.height - 0.5) * 10) / 10) }));
                  setHasUnsavedChanges(true);
                }}
                className="w-8 h-9 rounded bg-stone-900 border border-white/10 text-stone-300 hover:text-white"
              >
                -
              </button>
              <input
                type="number"
                step="0.1"
                min="2"
                max="100"
                value={activeCoords.height}
                onChange={(e) => {
                  setActiveCoords({ ...activeCoords, height: parseFloat(e.target.value) || 2 });
                  setHasUnsavedChanges(true);
                }}
                className="flex-1 h-9 px-2 text-center rounded bg-stone-900 border border-white/10 text-xs font-mono text-white"
              />
              <button
                onClick={() => {
                  setActiveCoords((c) => ({ ...c, height: Math.min(100 - c.y, Math.round((c.height + 0.5) * 10) / 10) }));
                  setHasUnsavedChanges(true);
                }}
                className="w-8 h-9 rounded bg-stone-900 border border-white/10 text-stone-300 hover:text-white"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminHotspotEditorPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-24 text-center text-xs text-stone-400 font-mono">
          <span className="inline-block w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
          <div>Initializing visual hotspot canvas...</div>
        </div>
      }
    >
      <HotspotEditorContent />
    </React.Suspense>
  );
}
