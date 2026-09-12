'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/types';
import { ProductForm } from '@/components/admin/ProductForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError(data.error || 'Product not found');
        }
      })
      .catch((err) => setError(err.message || 'Failed to fetch product'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-stone-400 font-mono">
        <span className="inline-block w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <div>Retrieving artifact details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-base text-red-400 font-medium">Artifact Not Found</h2>
        <p className="text-xs text-stone-400">{error || 'Could not find product with ID: ' + id}</p>
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-white/10 text-xs text-stone-300 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Return to Products List</span>
          </Link>
        </div>
      </div>
    );
  }

  return <ProductForm initialData={product} isNew={false} />;
}
