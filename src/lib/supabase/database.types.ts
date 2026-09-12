export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      hero_settings: {
        Row: {
          id: number;
          hero_image_url: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          hero_image_url: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          hero_image_url?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          uuid: string;
          title: string;
          slug: string;
          subtitle: string | null;
          category: string | null;
          description: string;
          story: string | null;
          price: number;
          original_price: number | null;
          currency: string | null;
          image_url: string;
          active: boolean;
          sort_order: number;
          hotspot_x: number;
          hotspot_y: number;
          hotspot_width: number;
          hotspot_height: number;
          z_index: number | null;
          dimensions: string | null;
          stock: number | null;
          lead_time: string | null;
          badge: string | null;
          spatial_tag: string | null;
          specs: Json | null;
          materials: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          uuid?: string;
          title: string;
          slug: string;
          subtitle?: string | null;
          category?: string | null;
          description: string;
          story?: string | null;
          price: number;
          original_price?: number | null;
          currency?: string | null;
          image_url: string;
          active?: boolean;
          sort_order?: number;
          hotspot_x?: number;
          hotspot_y?: number;
          hotspot_width?: number;
          hotspot_height?: number;
          z_index?: number | null;
          dimensions?: string | null;
          stock?: number | null;
          lead_time?: string | null;
          badge?: string | null;
          spatial_tag?: string | null;
          specs?: Json | null;
          materials?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          uuid?: string;
          title?: string;
          slug?: string;
          subtitle?: string | null;
          category?: string | null;
          description?: string;
          story?: string | null;
          price?: number;
          original_price?: number | null;
          currency?: string | null;
          image_url?: string;
          active?: boolean;
          sort_order?: number;
          hotspot_x?: number;
          hotspot_y?: number;
          hotspot_width?: number;
          hotspot_height?: number;
          z_index?: number | null;
          dimensions?: string | null;
          stock?: number | null;
          lead_time?: string | null;
          badge?: string | null;
          spatial_tag?: string | null;
          specs?: Json | null;
          materials?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
