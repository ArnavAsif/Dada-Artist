-- ==============================================================================
-- FEA ATELIER SPATIAL SHOWROOM — SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HERO SETTINGS TABLE
CREATE TABLE IF NOT EXISTS hero_settings (
  id SERIAL PRIMARY KEY,
  hero_image_url TEXT NOT NULL DEFAULT '/images/hero-room.png',
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure a single default row exists
INSERT INTO hero_settings (id, hero_image_url)
VALUES (1, '/images/hero-room.png')
ON CONFLICT (id) DO NOTHING;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  category TEXT DEFAULT 'Curated Decor',
  description TEXT NOT NULL,
  story TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  original_price NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  image_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  hotspot_x NUMERIC(6, 2) DEFAULT 50.00 NOT NULL,
  hotspot_y NUMERIC(6, 2) DEFAULT 50.00 NOT NULL,
  hotspot_width NUMERIC(6, 2) DEFAULT 10.00 NOT NULL,
  hotspot_height NUMERIC(6, 2) DEFAULT 10.00 NOT NULL,
  z_index INTEGER DEFAULT 10,
  dimensions TEXT DEFAULT '',
  stock INTEGER DEFAULT 1,
  lead_time TEXT DEFAULT 'In Stock • Ready to Dispatch',
  badge TEXT DEFAULT '',
  spatial_tag TEXT DEFAULT 'Living Salon',
  specs JSONB DEFAULT '[]'::jsonb,
  materials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index on sort_order and active for ultra-fast frontend queries
CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products (active, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);

-- 3. AUTOMATIC updated_at TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_products_updated_at ON products;
CREATE TRIGGER tr_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS tr_hero_settings_updated_at ON hero_settings;
CREATE TRIGGER tr_hero_settings_updated_at
BEFORE UPDATE ON hero_settings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;

-- Product policies
-- Public users: Can read active products (or all products if authenticated)
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (active = true OR auth.role() = 'authenticated');

-- Admin / Authenticated users: Can insert, update, delete products
DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Hero Settings policies
DROP POLICY IF EXISTS "Public can view hero settings" ON hero_settings;
CREATE POLICY "Public can view hero settings"
  ON hero_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update hero settings" ON hero_settings;
CREATE POLICY "Admins can update hero settings"
  ON hero_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. STORAGE BUCKETS CONFIGURATION
-- Create buckets for product-images and hero-images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('product-images', 'hero-images'));

DROP POLICY IF EXISTS "Authenticated Upload Images" ON storage.objects;
CREATE POLICY "Authenticated Upload Images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('product-images', 'hero-images'));

DROP POLICY IF EXISTS "Authenticated Update Images" ON storage.objects;
CREATE POLICY "Authenticated Update Images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('product-images', 'hero-images'));

DROP POLICY IF EXISTS "Authenticated Delete Images" ON storage.objects;
CREATE POLICY "Authenticated Delete Images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('product-images', 'hero-images'));
