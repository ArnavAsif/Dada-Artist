import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { HotspotCoordinates } from '@/types';
import { isSupabaseConfigured } from './supabase/client';
import { createAdminSupabaseClient } from './supabase/admin';

export interface CropOptions {
  coords: HotspotCoordinates;
  productId?: string;
  heroImageUrl?: string;
}

export interface CropResult {
  buffer: Buffer;
  filename: string;
  publicUrl: string;
  width: number;
  height: number;
}

/**
 * Crops a bounding-box region out of the hero room image
 * based on the product's hotspot percentage coordinates (x, y, width, height).
 */
export async function cropHeroImage(options: CropOptions): Promise<CropResult> {
  const { coords, productId = `product-${Date.now()}`, heroImageUrl } = options;

  let sourceBuffer: Buffer;

  try {
    if (heroImageUrl && (heroImageUrl.startsWith('http://') || heroImageUrl.startsWith('https://'))) {
      const res = await fetch(heroImageUrl);
      if (!res.ok) throw new Error(`Failed to fetch remote hero image: ${res.statusText}`);
      sourceBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      const relPath = heroImageUrl ? heroImageUrl.replace(/^\//, '') : 'images/hero-room.png';
      const localPath = path.join(process.cwd(), 'public', relPath);

      if (fs.existsSync(localPath)) {
        sourceBuffer = fs.readFileSync(localPath);
      } else {
        const fallbackPath = path.join(process.cwd(), 'public', 'images', 'hero-room.png');
        sourceBuffer = fs.readFileSync(fallbackPath);
      }
    }
  } catch (err) {
    console.warn('cropHeroImage fallback to default hero-room.png:', err);
    const fallbackPath = path.join(process.cwd(), 'public', 'images', 'hero-room.png');
    sourceBuffer = fs.readFileSync(fallbackPath);
  }

  const meta = await sharp(sourceBuffer).metadata();
  const imgW = meta.width || 1679;
  const imgH = meta.height || 937;

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const left = clamp(Math.round(((coords.x ?? 50) / 100) * imgW), 0, imgW - 10);
  const top = clamp(Math.round(((coords.y ?? 50) / 100) * imgH), 0, imgH - 10);
  const width = clamp(Math.round(((coords.width ?? 15) / 100) * imgW), 10, imgW - left);
  const height = clamp(Math.round(((coords.height ?? 20) / 100) * imgH), 10, imgH - top);

  const croppedBuffer = await sharp(sourceBuffer)
    .extract({ left, top, width, height })
    .png({ quality: 90, compressionLevel: 8 })
    .toBuffer();

  const cleanId = productId.replace(/[^a-z0-9_-]/gi, '') || 'artifact';
  const filename = `${cleanId}.png`;

  const productsDir = path.join(process.cwd(), 'public', 'products');
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
  }

  const outPath = path.join(productsDir, filename);
  fs.writeFileSync(outPath, croppedBuffer);

  let publicUrl = `/products/${filename}`;

  // Optional: Upload cropped asset to Supabase Storage if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filename, croppedBuffer, {
            contentType: 'image/png',
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filename);
          if (publicUrlData?.publicUrl) {
            publicUrl = publicUrlData.publicUrl;
          }
        }
      }
    } catch (uploadErr) {
      console.warn('Could not mirror crop to Supabase Storage, using local:', uploadErr);
    }
  }

  return {
    buffer: croppedBuffer,
    filename,
    publicUrl,
    width,
    height,
  };
}
