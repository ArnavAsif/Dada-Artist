import fs from 'fs';
import path from 'path';
import { Product, HotspotCoordinates } from '@/types';
import { SHOWROOM_PRODUCTS } from '@/data/products';
import { isSupabaseConfigured } from './client';
import { createAdminSupabaseClient } from './admin';
import { createServerSupabaseClient } from './server';
import { Database } from './database.types';

export type DatabaseProductRow = Database['public']['Tables']['products']['Row'];

// Local file store path for offline fallback persistence
const STORE_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'store.json');

interface LocalStoreData {
  hero_image_url: string;
  products: Product[];
}

const getInitialStoreData = (): LocalStoreData => ({
  hero_image_url: '/images/hero-room.png',
  products: SHOWROOM_PRODUCTS.map((p, idx) => ({
    ...p,
    sort_order: idx + 1,
    active: true,
  })),
});

const readLocalStore = (): LocalStoreData => {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial = getInitialStoreData();
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local store:', err);
    return getInitialStoreData();
  }
};

const writeLocalStore = (data: LocalStoreData) => {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local store:', err);
  }
};

// Map DB Row to Product Frontend Model
export const mapRowToProduct = (row: DatabaseProductRow): Product => {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle || '',
    category: row.category || 'Curated Decor',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    currency: row.currency || 'USD',
    image: row.image_url,
    description: row.description,
    story: row.story || '',
    specs: Array.isArray(row.specs) ? (row.specs as any) : [],
    materials: Array.isArray(row.materials) ? (row.materials as any) : [],
    dimensions: row.dimensions || '',
    stock: row.stock ?? 1,
    leadTime: row.lead_time || 'In Stock • Ready to Dispatch',
    badge: row.badge || undefined,
    spatialTag: row.spatial_tag || 'Living Salon',
    active: row.active,
    sort_order: row.sort_order,
    hotspot: {
      x: Number(row.hotspot_x),
      y: Number(row.hotspot_y),
      width: Number(row.hotspot_width),
      height: Number(row.hotspot_height),
      zIndex: row.z_index ?? 10,
    },
  };
};

// Map Product to DB Insert/Update
export const mapProductToRow = (product: Partial<Product>): Partial<DatabaseProductRow> => {
  const row: any = {};
  if (product.id !== undefined) row.id = product.id;
  if (product.title !== undefined) row.title = product.title;
  if (product.slug !== undefined) row.slug = product.slug;
  if (product.subtitle !== undefined) row.subtitle = product.subtitle;
  if (product.category !== undefined) row.category = product.category;
  if (product.description !== undefined) row.description = product.description;
  if (product.story !== undefined) row.story = product.story;
  if (product.price !== undefined) row.price = product.price;
  if (product.originalPrice !== undefined) row.original_price = product.originalPrice;
  if (product.currency !== undefined) row.currency = product.currency;
  if (product.image !== undefined) row.image_url = product.image;
  if (product.active !== undefined) row.active = product.active;
  if (product.sort_order !== undefined) row.sort_order = product.sort_order;
  if (product.dimensions !== undefined) row.dimensions = product.dimensions;
  if (product.stock !== undefined) row.stock = product.stock;
  if (product.leadTime !== undefined) row.lead_time = product.leadTime;
  if (product.badge !== undefined) row.badge = product.badge;
  if (product.spatialTag !== undefined) row.spatial_tag = product.spatialTag;
  if (product.specs !== undefined) row.specs = product.specs;
  if (product.materials !== undefined) row.materials = product.materials;

  if (product.hotspot) {
    if (product.hotspot.x !== undefined) row.hotspot_x = product.hotspot.x;
    if (product.hotspot.y !== undefined) row.hotspot_y = product.hotspot.y;
    if (product.hotspot.width !== undefined) row.hotspot_width = product.hotspot.width;
    if (product.hotspot.height !== undefined) row.hotspot_height = product.hotspot.height;
    if (product.hotspot.zIndex !== undefined) row.z_index = product.hotspot.zIndex;
  }

  return row;
};

// -----------------------------------------------------------------------------
// Core Service API
// -----------------------------------------------------------------------------

export const getProducts = async (options?: { activeOnly?: boolean }): Promise<Product[]> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
      if (supabase) {
        let query = supabase.from('products').select('*').order('sort_order', { ascending: true });
        if (options?.activeOnly) {
          query = query.eq('active', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(mapRowToProduct);
        }
      }
    } catch (err) {
      console.warn('Supabase getProducts error, falling back to local store:', err);
    }
  }

  const store = readLocalStore();
  let list = store.products;
  if (options?.activeOnly) {
    list = list.filter((p) => p.active !== false);
  }
  return list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
      if (supabase) {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (!error && data) {
          return mapRowToProduct(data);
        }
      }
    } catch (err) {
      console.warn('Supabase getProductById error, falling back:', err);
    }
  }

  const store = readLocalStore();
  const found = store.products.find((p) => p.id === id);
  return found || null;
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const id = productData.id || `product-${Date.now()}`;
  const slug =
    productData.slug ||
    productData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
    id;

  const newProduct: Product = {
    id,
    title: productData.title || 'Untitled Product',
    slug,
    subtitle: productData.subtitle || '',
    category: productData.category || 'Curated Decor',
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
    currency: productData.currency || 'USD',
    image: productData.image || '/products/botanica-relief-art.png',
    description: productData.description || '',
    story: productData.story || '',
    specs: productData.specs || [],
    materials: productData.materials || [],
    dimensions: productData.dimensions || '',
    stock: productData.stock ?? 1,
    leadTime: productData.leadTime || 'In Stock • Ready to Dispatch',
    badge: productData.badge || undefined,
    spatialTag: productData.spatialTag || 'Living Salon',
    active: productData.active !== undefined ? productData.active : true,
    sort_order: productData.sort_order ?? 99,
    hotspot: {
      x: productData.hotspot?.x ?? 50,
      y: productData.hotspot?.y ?? 50,
      width: productData.hotspot?.width ?? 12,
      height: productData.hotspot?.height ?? 18,
      zIndex: productData.hotspot?.zIndex ?? 10,
    },
  };

    if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
      if (supabase) {
        const row = mapProductToRow(newProduct);
        const { data, error } = await (supabase.from('products') as any).insert(row).select().single();
        if (!error && data) {
          return mapRowToProduct(data);
        }
        if (error) console.error('Supabase insert error:', error);
      }
    } catch (err) {
      console.error('Supabase createProduct error:', err);
    }
  }

  // Update local store
  const store = readLocalStore();
  store.products.push(newProduct);
  writeLocalStore(store);
  return newProduct;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product | null> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
      if (supabase) {
        const row = mapProductToRow(productData);
        const { data, error } = await (supabase.from('products') as any)
          .update(row)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return mapRowToProduct(data);
        }
        if (error) console.error('Supabase update error:', error);
      }
    } catch (err) {
      console.error('Supabase updateProduct error:', err);
    }
  }

  // Update local store
  const store = readLocalStore();
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = store.products[index];
  const updated: Product = {
    ...existing,
    ...productData,
    hotspot: {
      ...existing.hotspot,
      ...(productData.hotspot || {}),
    },
  };

  store.products[index] = updated;
  writeLocalStore(store);
  return updated;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
      if (supabase) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) return true;
        if (error) console.error('Supabase delete error:', error);
      }
    } catch (err) {
      console.error('Supabase deleteProduct error:', err);
    }
  }

  const store = readLocalStore();
  const initialLen = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  writeLocalStore(store);
  return store.products.length < initialLen;
};

export const updateHotspotPosition = async (
  id: string,
  coords: HotspotCoordinates
): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
      if (supabase) {
        const { error } = await (supabase.from('products') as any)
          .update({
            hotspot_x: coords.x,
            hotspot_y: coords.y,
            hotspot_width: coords.width,
            hotspot_height: coords.height,
            z_index: coords.zIndex ?? 10,
          })
          .eq('id', id);
        if (!error) return true;
      }
    } catch (err) {
      console.error('Supabase updateHotspotPosition error:', err);
    }
  }

  const store = readLocalStore();
  const product = store.products.find((p) => p.id === id);
  if (!product) return false;

  product.hotspot = {
    ...product.hotspot,
    ...coords,
  };
  writeLocalStore(store);
  return true;
};

export const updateSortOrders = async (
  items: { id: string; sort_order: number }[]
): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
      if (supabase) {
        for (const item of items) {
          await (supabase.from('products') as any).update({ sort_order: item.sort_order }).eq('id', item.id);
        }
        return true;
      }
    } catch (err) {
      console.error('Supabase updateSortOrders error:', err);
    }
  }

  const store = readLocalStore();
  for (const item of items) {
    const p = store.products.find((prod) => prod.id === item.id);
    if (p) p.sort_order = item.sort_order;
  }
  writeLocalStore(store);
  return true;
};

// -----------------------------------------------------------------------------
// Hero Settings Service
// -----------------------------------------------------------------------------

export const getHeroSettings = async (): Promise<{ hero_image_url: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
      if (supabase) {
        const { data, error } = await (supabase.from('hero_settings') as any)
          .select('hero_image_url')
          .eq('id', 1)
          .single();
        if (!error && data?.hero_image_url) {
          return { hero_image_url: data.hero_image_url };
        }
      }
    } catch (err) {
      console.warn('Supabase getHeroSettings error, falling back:', err);
    }
  }

  const store = readLocalStore();
  return { hero_image_url: store.hero_image_url || '/images/hero-room.png' };
};

export const updateHeroSettings = async (hero_image_url: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
      if (supabase) {
        const { error } = await (supabase.from('hero_settings') as any)
          .upsert({ id: 1, hero_image_url })
          .select();
        if (!error) return true;
        if (error) console.error('Supabase updateHeroSettings error:', error);
      }
    } catch (err) {
      console.error('Supabase updateHeroSettings error:', err);
    }
  }

  const store = readLocalStore();
  store.hero_image_url = hero_image_url;
  writeLocalStore(store);
  return true;
};

// -----------------------------------------------------------------------------
// Supabase Sync & Connection Status
// -----------------------------------------------------------------------------

export const checkSupabaseStatus = async () => {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase credentials not configured in .env.local. Operating in local mode.',
    };
  }

  try {
    const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
    if (!supabase) {
      return {
        connected: false,
        configured: true,
        message: 'Could not create Supabase client.',
      };
    }

    const { count, error } = await (supabase.from('products') as any)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        connected: false,
        configured: true,
        message: `Database connection error: ${error.message}. Please run supabase/schema.sql in your Supabase SQL editor.`,
      };
    }

    return {
      connected: true,
      configured: true,
      productCount: count ?? 0,
      message: 'Connected to Supabase PostgreSQL database successfully.',
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      message: `Connection test failed: ${err?.message || 'Unknown error'}`,
    };
  }
};

export const seedSupabaseFromLocal = async () => {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured yet.' };
  }

  try {
    const supabase = createAdminSupabaseClient() || (await createServerSupabaseClient());
    if (!supabase) return { success: false, message: 'Client unavailable' };

    const store = readLocalStore();

    // 1. Seed Hero
    await (supabase.from('hero_settings') as any).upsert({ id: 1, hero_image_url: store.hero_image_url });

    // 2. Seed Products
    let count = 0;
    for (const product of store.products) {
      const row = mapProductToRow(product);
      const { error } = await (supabase.from('products') as any).upsert(row);
      if (!error) count++;
      else console.error('Error seeding row:', error);
    }

    return { success: true, count, message: `Successfully seeded ${count} products to Supabase!` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Seeding failed' };
  }
};
