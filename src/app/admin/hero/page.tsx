'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Upload,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function AdminHeroPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('/images/hero-room.png');
  const [initialImageUrl, setInitialImageUrl] = useState<string>('/images/hero-room.png');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  useEffect(() => {
    fetch('/api/hero-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.hero_image_url) {
          setHeroImageUrl(data.settings.hero_image_url);
          setInitialImageUrl(data.settings.hero_image_url);
        }
      })
      .catch((err) => console.error('Failed to load hero settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setNotification(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'hero-images');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setHeroImageUrl(data.url);
      showToast(
        `Hero image uploaded successfully (${data.source === 'supabase' ? 'Supabase Storage' : 'Local Storage'}). Click Save to apply to public showroom!`
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to upload hero image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch('/api/hero-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero_image_url: heroImageUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update hero settings');
      }

      setInitialImageUrl(heroImageUrl);
      showToast('Hero image updated! The public showroom is now using this image.');
    } catch (err: any) {
      showToast(err.message || 'Saving failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    setHeroImageUrl('/images/hero-room.png');
    showToast('Reset to default room render. Click Save to apply.');
  };

  return (
    <div className="space-y-8 max-w-5xl">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">Hero Image Composition</h1>
          <p className="text-xs text-stone-400 mt-1">
            Replace or update the master 3D room render. The public showroom dynamically loads this image.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-white/10 hover:border-amber-400/40 text-stone-300 hover:text-white text-xs font-medium transition-colors"
          >
            <span>Preview Showroom</span>
            <ExternalLink size={13} className="text-amber-400" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving || uploading || heroImageUrl === initialImageUrl}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? 'Applying...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-amber-400" />
            <h2 className="text-sm font-medium text-white uppercase tracking-wider font-mono">
              Live Hero Composition Canvas
            </h2>
          </div>
          <span className="text-[10px] font-mono text-stone-400 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/5">
            Native Aspect Ratio: 1679 × 937
          </span>
        </div>

        {/* Big Preview */}
        <div className="relative w-full aspect-[1679/937] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt="Hero showroom composition"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs">
              No hero image specified
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-amber-300 text-xs">
              <span className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <span>Uploading high-resolution hero image to storage...</span>
            </div>
          )}
        </div>

        {/* Upload & Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
          {/* File Upload Button */}
          <div className="md:col-span-6 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full py-3 px-4 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              <span>Upload New Hero Image File</span>
            </button>
            <p className="text-[10px] text-stone-400 leading-relaxed">
              Accepts high-resolution JPG, PNG, WebP up to 12MB. Preserves full dynamic range.
            </p>
          </div>

          {/* Direct URL input & Reset */}
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://... or /images/..."
                className="flex-1 h-10 px-3.5 rounded-xl bg-stone-900 border border-white/10 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-400/60"
              />
              <button
                onClick={handleResetDefault}
                className="h-10 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-stone-400 hover:text-white text-xs transition-colors flex items-center gap-1.5 shrink-0"
                title="Reset to default render"
              >
                <RotateCcw size={13} />
                <span>Reset Default</span>
              </button>
            </div>
            <p className="text-[10px] text-stone-500 font-mono">
              Current source: {heroImageUrl}
            </p>
          </div>
        </div>
      </div>

      {/* Informational Guidance */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-stone-300 flex items-start gap-3">
        <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-amber-200">Hotspot Calibration Notice</p>
          <p className="text-stone-400 leading-relaxed text-[11px]">
            If you upload a completely different room render with rearranged furniture, remember to visit the{' '}
            <Link href="/admin/hotspots" className="text-amber-300 underline underline-offset-2">
              Visual Hotspot Editor
            </Link>{' '}
            to align product coordinates to the new object positions.
          </p>
        </div>
      </div>
    </div>
  );
}
