'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product, ProductSpec } from '@/types';
import {
  Upload,
  Image as ImageIcon,
  Crosshair,
  Save,
  Trash2,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ProductFormProps {
  initialData?: Product | null;
  isNew?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, isNew = false }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [category, setCategory] = useState(initialData?.category || 'Fine Furniture');
  const [price, setPrice] = useState<number | string>(initialData?.price ?? '');
  const [originalPrice, setOriginalPrice] = useState<number | string>(
    initialData?.originalPrice ?? ''
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [story, setStory] = useState(initialData?.story || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image || '');
  const [active, setActive] = useState(initialData?.active !== false);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 1);
  const [dimensions, setDimensions] = useState(initialData?.dimensions || '');
  const [stock, setStock] = useState(initialData?.stock ?? 3);
  const [leadTime, setLeadTime] = useState(initialData?.leadTime || 'In Stock • White-Glove Shipping');
  const [badge, setBadge] = useState(initialData?.badge || '');
  const [spatialTag, setSpatialTag] = useState(initialData?.spatialTag || 'Living Salon');

  // Hotspot coords
  const [hotspotX, setHotspotX] = useState<number>(initialData?.hotspot.x ?? 40);
  const [hotspotY, setHotspotY] = useState<number>(initialData?.hotspot.y ?? 40);
  const [hotspotW, setHotspotW] = useState<number>(initialData?.hotspot.width ?? 12);
  const [hotspotH, setHotspotH] = useState<number>(initialData?.hotspot.height ?? 20);

  // Specs & Materials
  const [specs, setSpecs] = useState<ProductSpec[]>(
    initialData?.specs || [
      { label: 'Dimensions', value: '' },
      { label: 'Materials', value: '' },
    ]
  );
  const [materials, setMaterials] = useState<string[]>(
    initialData?.materials || ['Belgian Linen', 'Solid Walnut']
  );
  const [newMaterial, setNewMaterial] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // Auto-generate slug from title if new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew || !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  // Upload image handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'product-images');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Image upload failed');
      }

      setImageUrl(data.url);
      setStatusMessage({
        text: `Image uploaded successfully (${data.source === 'supabase' ? 'Supabase Storage' : 'Local Storage'})`,
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Image upload failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const addSpec = () => {
    setSpecs([...specs, { label: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'label' | 'value', val: string) => {
    const next = [...specs];
    next[index][field] = val;
    setSpecs(next);
  };

  const addMaterialTag = () => {
    if (!newMaterial.trim()) return;
    setMaterials([...materials, newMaterial.trim()]);
    setNewMaterial('');
  };

  const removeMaterialTag = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ text: 'Product title is required.', type: 'error' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    const payload: Partial<Product> = {
      title,
      slug,
      subtitle,
      category,
      price: Number(price) || 0,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description,
      story,
      image: imageUrl,
      active,
      sort_order: Number(sortOrder) || 1,
      dimensions,
      stock: Number(stock) || 1,
      leadTime,
      badge: badge || undefined,
      spatialTag,
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      materials: materials.filter((m) => m.trim()),
      hotspot: {
        x: Number(hotspotX),
        y: Number(hotspotY),
        width: Number(hotspotW),
        height: Number(hotspotH),
      },
    };

    try {
      const url = isNew ? '/api/products' : `/api/products/${initialData?.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      setStatusMessage({
        text: isNew ? 'Product created successfully!' : 'Product changes saved successfully!',
        type: 'success',
      });

      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 900);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Saving failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-stone-900 border border-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-light text-white">
              {isNew ? 'Create New Showroom Artifact' : `Edit: ${initialData?.title}`}
            </h1>
            <p className="text-xs text-stone-400 font-mono mt-0.5">
              {isNew ? 'Catalog ID will be generated automatically' : `ID: ${initialData?.id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isNew && initialData && (
            <Link
              href={`/admin/hotspots?select=${initialData.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 border border-white/10 hover:border-amber-400/40 text-stone-300 hover:text-white text-xs font-medium transition-colors"
            >
              <Crosshair size={14} className="text-amber-400" />
              <span>Canvas Hotspot</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Product'}</span>
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
              : 'bg-red-950/60 text-red-300 border-red-500/30'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product Details & Copy */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Info */}
          <div className="p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-medium text-white uppercase tracking-wider font-mono">
              Product Information
            </h2>

            <div>
              <label className="block text-xs text-stone-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Botanica Gilded 3D Floral Wall Relief"
                className="w-full h-11 px-4 rounded-xl bg-stone-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Hand-Cast Porcelain & 24K Gold Leaf"
                  className="w-full h-10 px-4 rounded-xl bg-stone-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/60"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Fine Wall Sculptures"
                  className="w-full h-10 px-4 rounded-xl bg-stone-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1">Price (USD) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1420.00"
                  className="w-full h-10 px-4 rounded-xl bg-stone-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400/60"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Original Price (Strikeout)</label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="Optional comparison price"
                  className="w-full h-10 px-4 rounded-xl bg-stone-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400/60"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Atelier Signature"
                  className="w-full h-10 px-4 rounded-xl bg-stone-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Editorial presentation of the artifact..."
                className="w-full p-4 rounded-xl bg-stone-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/60 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">Artisan Heritage Story</label>
              <textarea
                rows={3}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Background craft story, workshops, materials, and origins..."
                className="w-full p-4 rounded-xl bg-stone-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/60 leading-relaxed"
              />
            </div>
          </div>

          {/* Specifications Accordion Editor */}
          <div className="p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white uppercase tracking-wider font-mono">
                Technical Specifications
              </h2>
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
              >
                <Plus size={13} />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spec.label}
                    onChange={(e) => updateSpec(i, 'label', e.target.value)}
                    placeholder="Specification (e.g. Weight)"
                    className="w-1/3 h-9 px-3 rounded-lg bg-stone-900 border border-white/10 text-xs text-stone-200"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpec(i, 'value', e.target.value)}
                    placeholder="Value (e.g. 11.5 kg)"
                    className="flex-1 h-9 px-3 rounded-lg bg-stone-900 border border-white/10 text-xs text-stone-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="p-2 text-stone-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Materials Tags */}
          <div className="p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-3">
            <h2 className="text-sm font-medium text-white uppercase tracking-wider font-mono">
              Artisan Materials
            </h2>
            <div className="flex flex-wrap gap-2">
              {materials.map((mat, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 border border-white/10 text-xs text-stone-200"
                >
                  <span>{mat}</span>
                  <button
                    type="button"
                    onClick={() => removeMaterialTag(i)}
                    className="text-stone-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 max-w-sm pt-2">
              <input
                type="text"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMaterialTag();
                  }
                }}
                placeholder="Add material tag..."
                className="flex-1 h-9 px-3 rounded-lg bg-stone-900 border border-white/10 text-xs text-white"
              />
              <button
                type="button"
                onClick={addMaterialTag}
                className="px-3 h-9 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-stone-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Image & Hotspot Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Product Image Card */}
          <div className="p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-medium text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Product Photography</span>
              <ImageIcon size={15} className="text-amber-400" />
            </h2>

            {/* Image Preview Box */}
            <div className="relative w-full aspect-square rounded-xl bg-stone-900 border border-white/10 overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title || 'Product preview'}
                  fill
                  sizes="320px"
                  className="object-contain p-4"
                />
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-3 text-center">
                  <Image
                    src={`/api/crop?x=${hotspotX}&y=${hotspotY}&w=${hotspotW}&h=${hotspotH}`}
                    alt="Scene crop preview"
                    fill
                    unoptimized
                    sizes="320px"
                    className="object-contain p-3"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-amber-300 border border-amber-400/30">
                    Scene Auto-Crop
                  </div>
                </div>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-xs text-amber-300">
                  <span className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span>Uploading to Supabase...</span>
                </div>
              )}
            </div>

            {/* Image Upload Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={14} className="text-amber-400" />
                  <span>{imageUrl ? 'Replace Custom Image' : 'Upload Custom Image'}</span>
                </button>

                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="px-3 py-2.5 rounded-xl border border-white/10 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-mono transition-colors"
                    title="Revert to auto-cropped scene image"
                  >
                    Auto-Crop
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Custom Image URL (Optional)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Leave blank to use auto-crop from scene hotspot"
                  className="w-full h-8 px-3 rounded-lg bg-stone-900 border border-white/10 text-[11px] font-mono text-stone-300 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-stone-500">
                {imageUrl
                  ? 'Using custom uploaded photography.'
                  : 'No custom image provided: displays the default scene image in cropped format.'}
              </p>
            </div>
          </div>

          {/* Hotspot Relative Coordinates */}
          <div className="p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white uppercase tracking-wider font-mono">
                Hotspot Geometry
              </h2>
              <Crosshair size={15} className="text-amber-400" />
            </div>

            <p className="text-[11px] text-stone-400 font-light leading-relaxed">
              Relative to hero image dimensions. Fine-tune percentages or use the visual canvas editor.
            </p>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">X Position (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={hotspotX}
                  onChange={(e) => setHotspotX(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 rounded-lg bg-stone-900 border border-white/10 text-stone-200"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Y Position (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={hotspotY}
                  onChange={(e) => setHotspotY(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 rounded-lg bg-stone-900 border border-white/10 text-stone-200"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Width (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="100"
                  value={hotspotW}
                  onChange={(e) => setHotspotW(parseFloat(e.target.value) || 1)}
                  className="w-full h-9 px-3 rounded-lg bg-stone-900 border border-white/10 text-stone-200"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Height (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="100"
                  value={hotspotH}
                  onChange={(e) => setHotspotH(parseFloat(e.target.value) || 1)}
                  className="w-full h-9 px-3 rounded-lg bg-stone-900 border border-white/10 text-stone-200"
                />
              </div>
            </div>

            {!isNew && initialData && (
              <Link
                href={`/admin/hotspots?select=${initialData.id}`}
                className="w-full py-2 px-3 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Crosshair size={13} />
                <span>Open Visual Hotspot Canvas</span>
              </Link>
            )}
          </div>

          {/* Visibility & Sorting */}
          <div className="p-6 rounded-2xl bg-stone-950/70 border border-white/10 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-medium text-white uppercase tracking-wider font-mono">
              Visibility & Ordering
            </h2>

            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <div className="text-xs text-stone-200 font-medium">Showroom Status</div>
                <div className="text-[10px] text-stone-500">Illuminates hotspot on public hero</div>
              </div>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  active ? 'bg-amber-400' : 'bg-stone-800'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-stone-950 transition-transform ${
                    active ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                className="w-full h-9 px-3 rounded-lg bg-stone-900 border border-white/10 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">Spatial Tag</label>
              <input
                type="text"
                value={spatialTag}
                onChange={(e) => setSpatialTag(e.target.value)}
                placeholder="e.g. Salon Reading Nook"
                className="w-full h-9 px-3 rounded-lg bg-stone-900 border border-white/10 text-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
