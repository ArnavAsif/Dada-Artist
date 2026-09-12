export interface HotspotCoordinates {
  x: number; // percentage from left (0 to 100)
  y: number; // percentage from top (0 to 100)
  width: number; // percentage width (0 to 100)
  height: number; // percentage height (0 to 100)
  zIndex?: number; // layering priority in overlapping scenes
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  uuid?: string;
  title: string;
  slug?: string;
  subtitle: string;
  category: string;
  price: number;
  originalPrice?: number;
  currency: string;
  image: string;
  description: string;
  story: string;
  specs: ProductSpec[];
  materials: string[];
  dimensions: string;
  stock: number;
  leadTime: string;
  hotspot: HotspotCoordinates;
  badge?: string;
  spatialTag: string;
  active?: boolean;
  sort_order?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: number;
}

export type LightingMode = 'warm-day' | 'ambient-evening' | 'gallery-focus';
