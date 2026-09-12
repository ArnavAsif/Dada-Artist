'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Crosshair,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoveUp,
  MoveDown,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Toggle active state
  const handleToggleActive = async (product: Product) => {
    const updatedState = !(product.active !== false);
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: updatedState } : p))
      );

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: updatedState }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Update failed');
      }

      showToast(`Product "${product.title}" is now ${updatedState ? 'Active' : 'Hidden'}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
      fetchProducts();
    }
  };

  // Reorder products (move up / down)
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const temp = newProducts[index];
    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = temp;

    const orderItems = newProducts.map((p, idx) => ({
      id: p.id,
      sort_order: idx + 1,
    }));

    setProducts(newProducts);

    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', items: orderItems }),
      });
      showToast('Catalog sort order updated.');
    } catch {
      showToast('Failed to save order', 'error');
      fetchProducts();
    }
  };

  // Confirm delete product
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast(`"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium tracking-wide flex items-center gap-2 border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
              : 'bg-red-950/90 text-red-300 border-red-500/40'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">Products Management</h1>
          <p className="text-xs text-stone-400 mt-1">
            Configure catalog titles, prices, photography, and live showroom visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/hotspots"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-white/10 hover:border-amber-400/40 text-stone-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Crosshair size={14} className="text-amber-400" />
            <span>Hotspot Editor</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, or ID..."
            className="w-full h-10 px-4 pl-10 rounded-xl bg-stone-950/80 border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400/60 transition-colors"
          />
          <Search size={15} className="absolute left-3.5 top-3 text-stone-500 pointer-events-none" />
        </div>

        <div className="text-xs font-mono text-stone-400">
          Showing {filtered.length} of {products.length} Products
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-white/10 bg-stone-950/70 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-stone-400 font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">Order</th>
                <th className="py-3.5 px-4">Artifact</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4 text-center">Hotspot Coord</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 font-light">
                    Loading spatial catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 font-light">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((product, idx) => {
                  const isActive = product.active !== false;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Reorder Steppers */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-0.5 text-stone-500">
                          <button
                            onClick={() => handleMove(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 hover:text-amber-300 disabled:opacity-20 transition-colors"
                            title="Move Up"
                          >
                            <MoveUp size={12} />
                          </button>
                          <span className="font-mono text-[10px] text-stone-400">{idx + 1}</span>
                          <button
                            onClick={() => handleMove(idx, 'down')}
                            disabled={idx === products.length - 1}
                            className="p-0.5 hover:text-amber-300 disabled:opacity-20 transition-colors"
                            title="Move Down"
                          >
                            <MoveDown size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-stone-900 border border-white/10 overflow-hidden shrink-0">
                            <Image
                              src={
                                product.image && !product.image.includes('hero-room.png')
                                  ? product.image
                                  : `/api/crop?productId=${product.id}&x=${product.hotspot.x}&y=${product.hotspot.y}&w=${product.hotspot.width}&h=${product.hotspot.height}`
                              }
                              alt={product.title}
                              fill
                              unoptimized={!product.image || product.image.includes('hero-room.png') || product.image.startsWith('/api/crop')}
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-stone-100 group-hover:text-amber-200 transition-colors">
                              {product.title}
                            </div>
                            <div className="text-[10px] text-stone-500 font-mono">
                              ID: {product.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-stone-900 border border-white/10 text-[10px] font-mono text-stone-300">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-mono text-amber-200 font-medium">
                        ${product.price.toLocaleString()}
                      </td>

                      {/* Hotspot Coordinates */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-[10px] text-stone-400 bg-white/[0.03] px-2 py-1 rounded-md border border-white/5">
                          X:{Math.round(product.hotspot.x)}% Y:{Math.round(product.hotspot.y)}%
                        </span>
                      </td>

                      {/* Active Toggle Switch */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider transition-all ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-stone-800 text-stone-400 border border-stone-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'
                            }`}
                          />
                          <span>{isActive ? 'ACTIVE' : 'HIDDEN'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/hotspots?select=${product.id}`}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
                            title="Position Hotspot on Hero Canvas"
                          >
                            <Crosshair size={15} />
                          </Link>

                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </Link>

                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-stone-950 border border-red-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Delete Product</h3>
                <p className="text-xs text-stone-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-white font-medium">&ldquo;{deleteTarget.title}&rdquo;</strong> from
              the spatial showroom and database?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-2 shadow-lg shadow-red-600/30"
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
