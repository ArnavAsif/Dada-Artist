import React from 'react';
import { getProducts, getHeroSettings } from '@/lib/supabase/service';
import { ShowroomClientApp } from '@/components/ShowroomClientApp';

// Force dynamic SSR so every browser reload queries the live database immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Fetch the actual current catalog from the database on the server
  const [products, heroSettings] = await Promise.all([
    getProducts({ activeOnly: true }),
    getHeroSettings(),
  ]);

  return (
    <ShowroomClientApp
      initialProducts={products}
      initialHeroImageUrl={heroSettings.hero_image_url}
    />
  );
}
